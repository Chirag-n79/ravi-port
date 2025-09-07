const docs = {};
let profileBlobURL = null;
let profileFile = null;

function handleProfileUpload(inputId, imgId, placeholderId, jpgBtnId, pdfBtnId){
  const input = document.getElementById(inputId);
  const img = document.getElementById(imgId);
  const placeholder = document.getElementById(placeholderId);
  const jpgBtn = document.getElementById(jpgBtnId);
  const pdfBtn = document.getElementById(pdfBtnId);

  input.addEventListener('change',(e)=>{
    const file = e.target.files[0];
    if(!file) return;
    if(profileBlobURL) URL.revokeObjectURL(profileBlobURL);
    profileBlobURL = URL.createObjectURL(file);
    img.src = profileBlobURL;
    img.style.display='block';
    placeholder.style.display='none';
    profileFile = file;
    jpgBtn.disabled = false;
    pdfBtn.disabled = false;
  });

  jpgBtn.addEventListener('click',()=>{
    if(profileBlobURL){
      const a=document.createElement('a');
      a.href=profileBlobURL;
      a.download=profileFile.name;
      a.click();
    }
  });

  pdfBtn.addEventListener('click',async ()=>{
    if(!profileFile) return;
    const { jsPDF } = window.jspdf;
    const dataURL = await readFileAsDataURL(profileFile);
    const imgObj = new Image();
    imgObj.src = dataURL;
    imgObj.onload=function(){
      const pdf=new jsPDF({orientation: imgObj.width>imgObj.height?'l':'p',unit:'px',format:[imgObj.width,imgObj.height]});
      pdf.addImage(imgObj,'JPEG',0,0,imgObj.width,imgObj.height);
      pdf.save('profile.pdf');
    };
  });
}

function handleDocUpload(inputId, previewId, downloadBtnId, key){
  const input=document.getElementById(inputId);
  const preview=document.getElementById(previewId);
  const downloadBtn=document.getElementById(downloadBtnId);

  input.addEventListener('change',(e)=>{
    const file=e.target.files[0];
    if(!file) return;
    if(docs[key] && docs[key].url) URL.revokeObjectURL(docs[key].url);
    const url=URL.createObjectURL(file);
    docs[key]={file,url};
    preview.innerHTML='';
    if(file.type.startsWith('image/')){
      const img=document.createElement('img');
      img.src=url; img.style.width='100%'; img.style.height='100%'; img.style.objectFit='cover';
      preview.appendChild(img);
    }else{
      preview.innerText=file.name;
    }
    downloadBtn.disabled=false;
    downloadBtn.onclick=()=>{
      if(file.type==='application/pdf') window.open(url,'_blank');
      else { let a=document.createElement('a'); a.href=url; a.download=file.name; a.click(); }
    };
  });
}

function clearDoc(key,previewId,downloadBtnId){
  if(docs[key]){ URL.revokeObjectURL(docs[key].url); delete docs[key]; }
  document.getElementById(previewId).innerHTML='<div class="no-file">No file uploaded</div>';
  document.getElementById(downloadBtnId).disabled=true;
}

function readFileAsDataURL(file){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>res(fr.result);
    fr.onerror=rej;
    fr.readAsDataURL(file);
  });
}
