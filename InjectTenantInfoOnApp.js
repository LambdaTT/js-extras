/**
 * Este script é uma função AWS Lambda@Edge associada às distribuições cloudfront do app (prod e HML)
 * Ela deve ser associada a um behavior específico do caminho "/index.html"
 * O propósito desta Lambda é proporcionar a funcionalidade de white-label multitenant
 * injetando no corpo da página index.html informações relativas ao tenant, antes mesmo do html chegar ao client.
 * As informações modificadas são: o endereço do manifest.json, apontando para a API e a inclusão do parâmetro "tenant_key"
 * em algumas URL chave, como a dos apple-touch-icon e manifest, por exemplo.
 */

'use strict';
const BUCKET_HML_NAME = 'cartappio-app-hml';
const BUCKET_PROD_NAME = 'cartappio-app-prod';
const FILE_NAME = 'index.html';
const HML_TENANTKEY = 'barexemplo';

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { Buffer } = require('buffer');

const s3 = new S3Client({ region: 'us-east-1' }); // Região obrigatória

var isHml = false;

exports.handler = async (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const host = request.headers['host'][0].value;
  const tenant = host.split('.')[0];
  isHml = tenant == HML_TENANTKEY;
  const manifestUrl = `https://${isHml ? 'hml-api' : 'api'}.sindiapp.app.br/api/app/metadata/v1/tenant-manifest?tenant_key=${tenant}`;

  try {
    const command = new GetObjectCommand({ Bucket: isHml ? BUCKET_HML_NAME : BUCKET_PROD_NAME, Key: FILE_NAME });
    const response = await s3.send(command);

    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
      });

    // Decodifica o body original vindo do S3
    const originalBody = await streamToString(response.Body);

    // Faz as substituições necessárias
    const htmlWithTenant = originalBody
      .replace(/TENANT_DOMAIN/g, tenant)
      .replace(/href="\/manifest\.json"/, `href="${manifestUrl}"`)
      .replace(/<head>/, `<head>\n<!-- Funcao Lambda Executada com sucesso -->`);

    const newResponse = {
      status: 200,
      statusDescription: 'Ok',
      headers: {
        'content-type': [{
          key: 'Content-Type',
          value: 'text/html; charset=utf-8',
        }],
        'last-modified': [{
          key: 'Last-Modified',
          value: response.LastModified.toUTCString(),
        }],
        'etag': [{
          key: 'ETag',
          value: response.ETag,
        }],
        'cache-control': [{
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        }],
      },
      body: Buffer.from(htmlWithTenant).toString('base64'),
      bodyEncoding: 'base64'
    };


    callback(null, newResponse);

  } catch (err) {
    console.error('Erro ao modificar body no viewer response:', err);

    callback(null, {
      status: '500',
      statusDescription: 'Internal Server Error',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/plain' }]
      },
      body: 'Erro ao modificar resposta para tenant.',
      bodyEncoding: 'text'
    });
  }
};