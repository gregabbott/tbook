// By + (C) Greg Abbott 2024 V 2024-11-19
const glob ={}
const el = {}
const ids = [
  `textarea_txt_holder`,
  `file_picker`,
  `make_content_ascii`,
  `save_button`
]
const turndown_service = new TurndownService({
  headingStyle:`atx`,//# hash prefixed headers, not underlined
  emDelimiter:`*`,
  strongDelimiter:`**`,
})
function to_markdown(s){return turndown_service.turndown(s)}
function log(x){console.log(x);return x}
function chain(c,...n){return n.reduce(((c,n)=>n(c)),c)}
function gebi(x){return document.getElementById(x)}
function plural (word,n){return n+' '+word+(n==1?'':'s')}
ids.forEach(id=>{el[id]=gebi(id)})
el.file_picker.addEventListener('change',e=>read_zips(e.target))
add_drag_drop(el.file_picker)
function add_drag_drop(picker){ 
  function on(f){return n=>window.addEventListener(n,f,false)}
  function stop(e){e.stopPropagation();e.preventDefault()}
  function deactivate(){picker.classList.remove('drag')}
  function activate(){picker.classList.add('drag')};
  ['dragenter','dragover','dragleave','drop'].forEach(on(stop));
  ['dragenter', 'dragover'].forEach(on(activate))
  on(deactivate)('dragleave')
  on(handle_drop)('drop')
  function handle_drop(e){
    deactivate()
    picker.files = [...e.dataTransfer.files]
    .reduce((a,f)=>{a.items.add(f);return a},new DataTransfer())
    .files
    read_zips(e.dataTransfer)
  }
}
function message(s){el.textarea_txt_holder.value=s}
function read_zips(event){
  const files = [...event.files]
  let epub_types=[
    //"application/zip",
    'application/epub+zip'
  ]
  const acceptable=files.filter(x=>epub_types.includes(x.type))
  if(!acceptable[0]){return message('Unaccepted file types')}
  read_zip({
    i:0,
    files:acceptable,//zips
    thenFn:unzip,
    finallyFn:process_unzipped_files
  }) //onread fn of zip1 calls `read(zip2)` etc.
}
function read_zip({i,files,thenFn,finallyFn}){
  const file = files[i]
  file.full_name= file.name,
  file.ext= file.name.split(".").pop()
  file.base_name=file.full_name.substring(0,
    file.full_name.lastIndexOf('.'))
  const reader=new FileReader()
  reader.onload=()=>{
    file.data=new Uint8Array(reader.result)//the zip
    thenFn(file)//get zip content
    delete file.data//trash zipped content
    let have_read_all_files=i==files.length-1
    if(have_read_all_files){finallyFn(files)}
    else{read_zip({i:i+1,files,thenFn,finallyFn})}//read next
  }
  reader.readAsArrayBuffer(file)
}
function unzip(to_unzip) {
  function uint8_array_to_string(uint8Array) {
    const decoder = new TextDecoder("utf-8")
    return decoder.decode(uint8Array)
  }
  function uint8_is_valid_utf8(bytes) {
    const is_continuation = byte => (byte & 192) === 128
    const get_sequence_length = byte =>
      byte <= 127 ? 1 :
      byte >= 194 && byte <= 223 ? 2 :
      byte >= 224 && byte <= 239 ? 3 :
      byte >= 240 && byte <= 244 ? 4 :
      0
    let i = 0
    while (i < bytes.length) {
      const seq_len = get_sequence_length(bytes[i])
      if (seq_len === 0 || i + seq_len > bytes.length){
        return false
      }
      if (!bytes.slice(i+1, i+seq_len).every(is_continuation)){
        return false
      }
      i += seq_len
    }
    return true
  }
  const zip = fflate.unzipSync(to_unzip.data)//{fPath:uint8Array,}
  to_unzip.files = []
  //string_file_extensions=["md","txt","mmd","html","js","css","xhtml"]
  for (const path in zip) {
    if (!zip.hasOwnProperty(path)) {continue}
    let file = {
      path,
      full_name:path.split('/').pop(),
      ext:path.split(".").pop(),
      data:  
      //zip[path]==file data
      //NOTE: 
      //can leave as uint8Array and only convert when needed
      //can also only convert if extension matches one in list
      //e.g. string_file_extensions.includes(ext)
        //to save checking if uint8_is_valid_utf8
      uint8_is_valid_utf8(zip[path])//StringLike
        ? uint8_array_to_string(zip[path]) //To String
        : zip[path],//not to string
    }
    file.base_name= file.full_name.substring(0,
    file.full_name.lastIndexOf('.'))
    to_unzip.files.push(file)
  }
  return to_unzip
}
function process_unzipped_files(files){
  //console.log(glob.unzipped)
  /*files ==  [array of arrays, one sub array per .epub:
      [
      name:epub1Name,
      chapters:[{content,title:ch1},{etc}]
        //^ i.e. html/xhtml files per section in epub
      ],…
    ]*/
  files.forEach(process_book)
  glob.summary=plural('Converted EPUB',files.length)
  glob.unzipped=files//for inspecting
  message(
    `Processed ${glob.summary}:\n`+
    //name each book processed
    glob.unzipped.reduce((a,f)=>a+=f.best_name+'\n',``)
  )
  let zip = make_zip(glob.unzipped)//{fPathNameExt:Data}
  let downloadLink=saver({zip,name:glob.summary})
    downloadLink.click()//auto
  //allow user to save manually in case browser blocks auto-save
  el.save_button.disabled=false
  el.save_button.hidden=false
  el.save_button.onclick=()=>downloadLink.click()
}
function saver({zip,name}){
  let zip_blob = new Blob(
    [fflate.zipSync(zip)],
    {type: 'application/zip'}
  )
  const link = document.createElement('a')
  link.href = URL.createObjectURL(zip_blob)
  link.download = name+`.zip`
  return link
}
function parse_opf(s){
  const d=(new DOMParser()).parseFromString(s,"application/xml")
  let errors=d.getElementsByTagName("parsererror").length > 0
  return errors?(log("Error parsing OPF string"),false):d
}
function get_meta(opf) {
  if(!opf)return {}
    const doc=opf
  return [...doc.querySelectorAll("*")].reduce((a,L) => {
    //look through all elements in the parsed OPF file
    let is_dc_tag=L.tagName.toLowerCase().startsWith("dc:")
    let has_id = L.id!==undefined&&L.id.length>0
    let worth_checking_content= is_dc_tag||has_id
      if(!worth_checking_content)return a
    let text_content = L.textContent.trim()
    let is_empty=text_content.length==0
      if(is_empty)return a
    let clean_dc_tag=!is_dc_tag?'':L.tagName.replace(/dc:/gi,'')
    let processed_id = !has_id?'':L.id
      .replace(new RegExp(`^${clean_dc_tag}-*`,'i'),'')
      .replaceAll('-','_')
    let joiner = is_dc_tag&&processed_id.length>0?'_':''
    let key = (clean_dc_tag+joiner+processed_id)
    a[key.toLowerCase().trim()]=chain(
      text_content,
      process_text({ascii_wanted:el.make_content_ascii.checked})
    ).trim()

    return a
    },{})//{creator,title}
}
function process_book(book){
  //get the file in .epub that contains its metadata
  let parsed_opf=chain(
    book.files.filter(x=>x.ext=='opf')[0].data,
    parse_opf
  )
  //use it to get:
  book.meta=get_meta(parsed_opf)
  book.chapter_order=parse_epub_order(parsed_opf)
  
  // process files within book
  let unordered_chapters = //{fName2:{theFile},fName1:{theFile}}
    book.files
    .reduce((a,file)=>{
      let not_a_chapter=!['xhtml',`html`].includes(file.ext)
      if(not_a_chapter){return a }//no need to process
      a[file.full_name]=process_chapter(file)
      return a
    },{})
  //ordered chapters
  book.chapters=book.chapter_order
  .reduce((a,filename) =>{
    let chapter = unordered_chapters[filename]
    if(
      //unfound or no content
      !chapter||chapter.is_empty
    ){return a}//don't store
    a.push(chapter)
    chapter.file_name_title= 
      (a.length+'').padStart(2,'0')+//number based on kept files
      // Include title in name, if found in file
      (chapter.title.trim().length>0?` `+chapter.title:'')
    return a
  },[])
  //make a file to preserve the collected metadata
  book.chapters.push({
    file_name_title:'00 Meta',
    processed_data:JSON.stringify(book.meta,null,'\t'),
    processed_ext:'json'
  })
  book.best_name=get_best_book_name(book)
}
function get_best_book_name(book){
  //if meta use that, else fallback to name of epub file
  /*let book = {
    meta:{
      author:'1',
      creator_author:"2",
      creator:'3',
      title:"Name"
    },
    base_name:'Name By X',
  }*/
  let author = 
      book.meta.author||
      book.meta.creator_author||
      book.meta.creator||
      book.base_name
  let title= book.meta.title||
      (author==book.base_name?'':book.base_name)
  return author+' - '+title
}
function base_name_and_ext_from_path(path){
  return path.split('/').pop() 
}
function parse_epub_order(opf){//XML
  const manifest = [...opf.querySelectorAll('manifest > item')]
  const spine = [...opf.querySelectorAll('spine > itemref')]
  const id_to_href = manifest.reduce((acc, item) => {
    const full_href = item.getAttribute('href')
      //^ path/sub/name.xhtml
    const filename = base_name_and_ext_from_path(full_href)
      //^ name.xhtml
    let id=item.getAttribute('id')
    acc[id] = filename
    return acc
  }, {})
  const ordered_files = spine.map(item_ref =>
    id_to_href[item_ref.getAttribute('idref')]
  )
  return ordered_files
}
function process_chapter(file){
  const P = new DOMParser()
  const doc=P.parseFromString(file.data,"application/xhtml+xml")
  file.processed_data = chain(
    doc.body,
    to_markdown,
    process_text({ascii_wanted:el.make_content_ascii.checked})
  )
  .trim()
  file.processed_ext='md'
  file.is_empty=file.processed_data.length===0
  if(file.is_empty)return file//no title within
  file.title = 
    [...doc.body.querySelectorAll('h1,h2,h3,h4,h5,h6')]//all Hs
    .map(x=>x.textContent.trim())//trim each
    .filter(x=>x.length>0)//keep only non blank headers
    [0]
    ?.trim()//the first serves as the title
    ||''//use a blank string for chapter without any headers
    file.title = process_text({ascii_wanted:true})(file.title)
  return file
}
function make_zip(folders){
  const zip = {}
  folders.forEach(folder => {
    folder.chapters.forEach(file => {
      // key == file path, name, ext. value == file data
      let path =
        folder.best_name+'/'+
        file.file_name_title+
        '.'+file.processed_ext
      //writing string so encode
      zip[path] = new TextEncoder().encode(file.processed_data)
    })
  })
  return zip
}