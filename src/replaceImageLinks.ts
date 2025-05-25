

/** Given a line of text, it replaces the occurrence of [imageN] links with (./images/imageN) */
export function replaceImageLinks(text: string): string {
  const regex = /!\[\]\[image(\d+)\]/g
  return text.replaceAll(regex,(_,p1)=>{
    return `![](./images/image${p1}.png)`
  })
}


