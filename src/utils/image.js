const MAX_PDF_BYTES = 4_000_000
const MAX_IMAGE_SIDE = 1600

export function validateAttachment(file) {
  const extension = file?.name?.split('.').pop()?.toLowerCase()
  const allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp']
  if (!file || !allowed.includes(extension)) {
    throw new Error('प्रारूप समर्थित नहीं है। PDF, PNG, JPG, JPEG या WEBP फ़ाइल चुनें।')
  }
  if (extension === 'pdf' && file.size > MAX_PDF_BYTES) {
    throw new Error('PDF 4 MB से बड़ी है। कृपया छोटी फ़ाइल चुनें।')
  }
  if (extension !== 'pdf' && !file.type.startsWith('image/')) {
    throw new Error('यह छवि फ़ाइल पढ़ी नहीं जा सकी। कृपया PNG, JPG या WEBP छवि चुनें।')
  }
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('छवि नहीं खुल सकी। कृपया दूसरी फ़ाइल चुनें।'))
    }
    image.src = objectUrl
  })
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('छवि तैयार नहीं हो सकी। कृपया दूसरी फ़ाइल चुनें।'))
    }, 'image/jpeg', 0.8)
  })
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('फ़ाइल पढ़ी नहीं जा सकी। कृपया पुनः प्रयास करें।'))
    reader.onerror = () => reject(new Error('फ़ाइल पढ़ी नहीं जा सकी। कृपया पुनः प्रयास करें।'))
    reader.readAsDataURL(file)
  })
}

export async function encodeAttachment(file) {
  validateAttachment(file)
  if (file.name.toLowerCase().endsWith('.pdf')) {
    return { file_base64: await readAsDataURL(file), file_name: file.name }
  }

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('छवि प्रक्रिया नहीं हो सकी। कृपया दूसरी फ़ाइल चुनें।')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const compressed = new File([await canvasToBlob(canvas)], file.name.replace(/\.[^.]+$/, '.jpg'), {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
  return { file_base64: await readAsDataURL(compressed), file_name: compressed.name }
}
