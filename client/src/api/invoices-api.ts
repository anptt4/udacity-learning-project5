import { apiEndpoint } from '../config'
import { Invoice } from '../types/Invoice';
import { CreateInvoiceRequest } from '../types/CreateInvoiceRequest';
import Axios from 'axios'
import { UpdateInvoiceRequest } from '../types/UpdateInvoiceRequest';
const list: Invoice[] = [
  { "invoiceId": "10", "title": "My Home", content: "Parse parses, validates, verifies the signature and returns the parsed token. keyFunc will receive the parsed token and should return the cryptographic key for verifying the signature. The caller is strongly encouraged to set the WithValidMethods option to validate the 'alg' claim in the token matches the expected algorithm. For more details about the importance of validating the 'alg' claim, see https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/", createdAt: "20/10/2022", urlImage: "https://th.bing.com/th/id/OIP.ObCoZ4Z_ffF0d01yTgHJFwHaE8?pid=ImgDet&rs=1" ,price:"100"},
  { "invoiceId": "11", "title": "My Home2", content: "Parse parses, validates, verifies the signature and returns the parsed token. keyFunc will receive the parsed token and should return the cryptographic key for verifying the signature. The caller is strongly encouraged to set the WithValidMethods option to validate the 'alg' claim in the token matches the expected algorithm. For more details about the importance of validating the 'alg' claim, see https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/", createdAt: "20/10/2022", urlImage: "https://th.bing.com/th/id/OIP.ObCoZ4Z_ffF0d01yTgHJFwHaE8?pid=ImgDet&rs=1", price:"200" },
  { "invoiceId": "12", "title": "My Home3", content: "Parse parses, validates, verifies the signature and returns the parsed token. keyFunc will receive the parsed token and should return the cryptographic key for verifying the signature. The caller is strongly encouraged to set the WithValidMethods option to validate the 'alg' claim in the token matches the expected algorithm. For more details about the importance of validating the 'alg' claim, see https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/", createdAt: "20/10/2022", urlImage: "https://th.bing.com/th/id/OIP.ObCoZ4Z_ffF0d01yTgHJFwHaE8?pid=ImgDet&rs=1" , price:"400" },
  { "invoiceId": "13", "title": "My Home4", content: "Parse parses, validates, verifies the signature and returns the parsed token. keyFunc will receive the parsed token and should return the cryptographic key for verifying the signature. The caller is strongly encouraged to set the WithValidMethods option to validate the 'alg' claim in the token matches the expected algorithm. For more details about the importance of validating the 'alg' claim, see https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/", createdAt: "20/10/2022", urlImage: "https://th.bing.com/th/id/OIP.ObCoZ4Z_ffF0d01yTgHJFwHaE8?pid=ImgDet&rs=1", price:"200"  }
]
const FileDownload = require('js-file-download')

export async function getInvoices(idToken: string): Promise<Invoice[]> {
  console.log('Fetching invoices')

  const response = await Axios.get(`${apiEndpoint}/invoices`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Invoices:', response.data)
  return response.data.items

}

export async function findInvoicesByName(idToken: string, name: string): Promise<Invoice[]> {
  console.log('findInvoicesByName invoices')

  const response = await Axios.get(`${apiEndpoint}/invoices/search?name=${name}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Invoices:', response.data)
  return response.data.items
}

export async function createInvoice(
  idToken: string,
  newInvoice: CreateInvoiceRequest,
  file: Buffer
) {
  console.log("create info ", newInvoice)
  console.log("img ", file)
  const response = await Axios.post(`${apiEndpoint}/invoices`, JSON.stringify(newInvoice), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  }).then(async (res) => {
    await uploadFile(res.data.url, file).then(async () => { return res.data.item })
  })

}

export async function patchInvoice(
  idToken: string,
  invoiceId: string,
  updatedInvoice: UpdateInvoiceRequest,
  file: Buffer
): Promise<void> {
  console.log("patchInvoice info ", updatedInvoice)
  console.log("invoiceId info ", invoiceId)
  await Axios.put(`${apiEndpoint}/invoices/${invoiceId}`, JSON.stringify(updatedInvoice), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  }).then(async (res) => {
    if (file != null) {
      await uploadFile(res.data.url, file)
    } else {
      alert("Action success")
    }
  })
}

export async function deleteInvoice(
  idToken: string,
  invoiceId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/invoices/${invoiceId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

// export async function getUploadUrl(
//   idToken: string,
//   todoId: string
// ): Promise<string> {
//   const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, '', {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${idToken}`
//     }
//   })
//   return response.data.uploadUrl
// }

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  console.log("uploadFile item", file)
  console.log("uploadFile url", uploadUrl)
  await Axios.put(uploadUrl, file).then(() => {
    alert("Action success")
  })
}

export function download(url: string, filename: string) {
  // url="/"+url
  Axios({
    url,
    method: 'GET',
    responseType: 'blob',
  }).then((response) => {
      FileDownload(response.data, filename+".png");
  });
}