"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, UploadCloud, ShieldCheck } from "lucide-react";
import LoadingWrapped from "@/components/analysis/LoadingWrapped";
import { useRouter } from "next/navigation";


export default function CreatePage(){


const [file,setFile] = useState<File | null>(null);

const [loading,setLoading] = useState(false);

const router = useRouter();



function handleFile(file:File){

setFile(file);

setLoading(true);



setTimeout(()=>{


router.push("/w/nossa-historia");


},9000);



}




if(loading){

return (

<LoadingWrapped />

)

}





return (

<main className="
min-h-screen
flex
items-center
justify-center
relative
overflow-hidden
bg-gradient-to-br
from-[#12051f]
via-[#260b38]
to-[#05020a]
text-white
px-6
">


<div className="
absolute
top-20
left-10
w-[300px]
h-[300px]
bg-pink-500/20
blur-[120px]
rounded-full
"/>



<div className="
absolute
bottom-20
right-10
w-[300px]
h-[300px]
bg-purple-500/20
blur-[120px]
rounded-full
"/>




<motion.div

initial={{
opacity:0,
y:40
}}

animate={{
opacity:1,
y:0
}}

className="
relative
z-10
max-w-md
w-full
text-center
"

>



<motion.div

animate={{
scale:[1,1.08,1]
}}

transition={{
duration:2,
repeat:Infinity
}}

>

<Heart

className="
mx-auto
w-14
h-14
text-pink-400
fill-pink-400
"

/>

</motion.div>




<h1 className="
mt-8
text-4xl
font-bold
">

Vamos criar

<br/>

<span className="
bg-gradient-to-r
from-pink-400
to-purple-400
bg-clip-text
text-transparent
">

nossa história ❤️

</span>


</h1>




<p className="
mt-5
text-white/70
">

Escolha a conversa que guarda
os momentos mais especiais.

</p>





<div className="
mt-10
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-8
shadow-2xl
">


<UploadCloud

className="
mx-auto
w-14
h-14
text-pink-400
"

/>



<h2 className="
mt-5
text-xl
font-semibold
">

Enviar conversa

</h2>



<p className="
mt-2
text-sm
text-white/60
">

Aceitamos arquivo .txt exportado do WhatsApp

</p>





<label

className="
mt-8
inline-flex
cursor-pointer
items-center
justify-center
px-8
py-4
rounded-full
bg-pink-500
hover:bg-pink-400
transition
font-semibold
shadow-lg
shadow-pink-500/30
"

>


{

file ?

file.name

:

"Escolher arquivo ❤️"

}



<input

type="file"

accept=".txt"

className="hidden"

onChange={(e)=>{

if(e.target.files?.[0]){

handleFile(e.target.files[0]);

}

}}

/>


</label>




</div>




<div className="
mt-8
flex
justify-center
items-center
gap-2
text-sm
text-white/50
">


<ShieldCheck

className="
w-4
h-4
text-pink-400
"

/>


Sua conversa é usada apenas
para criar sua história.


</div>




</motion.div>



</main>

)


}