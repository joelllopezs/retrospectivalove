"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";


export default function Hero(){

const router = useRouter();


return (

<section className="
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
">


<div className="
absolute
w-[400px]
h-[400px]
bg-pink-500/30
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

transition={{
duration:1
}}

className="
relative
z-10
text-center
px-6
"

>


<motion.div

animate={{
scale:[1,1.1,1]
}}

transition={{
repeat:Infinity,
duration:2
}}

>


<Heart

className="
mx-auto
text-pink-400
fill-pink-400
w-16
h-16
"

/>


</motion.div>



<h1 className="
mt-8
text-5xl
font-bold
tracking-tight
">

Love

<br/>


<span className="
bg-gradient-to-r
from-pink-400
to-purple-400
bg-clip-text
text-transparent
">

Wrapped

</span>


</h1>



<p className="
mt-6
text-lg
text-white/70
max-w-md
mx-auto
">

Transforme uma conversa em
uma história inesquecível ❤️

</p>




<button

onClick={() => router.push("/create")}

className="
mt-10
px-8
py-4
rounded-full
bg-pink-500
hover:bg-pink-400
transition
shadow-xl
shadow-pink-500/30
font-semibold
"

>

Criar nossa história ❤️

</button>



</motion.div>


</section>

)

}