"use client";

import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  MessageCircle,
  Check,
  Moon
} from "lucide-react";

import { useEffect, useState } from "react";
import FloatingHearts from "./FloatingHearts";


const steps = [
  {
    text: "Recebendo sua conversa",
    icon: MessageCircle
  },
  {
    text: "Encontrando momentos especiais",
    icon: Heart
  },
  {
    text: "Analisando palavras e sentimentos",
    icon: Sparkles
  },
  {
    text: "Criando sua história",
    icon: Moon
  }
];


const memories = [
  "bom dia ❤️",
  "senti sua falta hoje",
  "você me faz feliz",
  "boa noite meu amor 🌙",
  "te amo ❤️"
];



export default function LoadingWrapped(){


const [currentStep,setCurrentStep] = useState(0);

const [memory,setMemory] = useState(0);



useEffect(()=>{


const stepTimer = setInterval(()=>{


setCurrentStep(prev=>{

if(prev < steps.length -1){

return prev +1;

}

return prev;

});


},2000);



const memoryTimer = setInterval(()=>{


setMemory(prev=>{

if(prev < memories.length-1){

return prev+1;

}

return 0;

});


},1800);



return ()=>{

clearInterval(stepTimer);

clearInterval(memoryTimer);

};


},[]);




return (

<section className="
min-h-screen
relative
overflow-hidden
flex
items-center
justify-center
bg-gradient-to-br
from-[#12051f]
via-[#260b38]
to-[#05020a]
text-white
px-6
">


<FloatingHearts />



{/* brilho central */}

<motion.div

animate={{

scale:[
1,
1.3,
1
],

opacity:[
0.3,
0.7,
0.3

]

}}

transition={{

duration:4,

repeat:Infinity

}}

className="
absolute
w-[350px]
h-[350px]
rounded-full
bg-pink-500/30
blur-[120px]
"

/>





<div className="
absolute
inset-0
bg-[radial-gradient(circle_at_center,rgba(255,100,180,0.12),transparent_40%)]
"/>






<motion.div

initial={{
opacity:0,
scale:.8
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:.8
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
scale:[
1,
1.15,
1
]
}}

transition={{
duration:2,
repeat:Infinity
}}

>

<Heart

className="
mx-auto
w-20
h-20
fill-pink-400
text-pink-400
"

/>


</motion.div>





<h1 className="
mt-8
text-4xl
font-bold
">

Criando sua

<br/>


<span className="
bg-gradient-to-r
from-pink-400
to-purple-400
bg-clip-text
text-transparent
">

história ❤️

</span>


</h1>




<p className="
mt-4
text-white/60
">

Transformando mensagens
em momentos inesquecíveis.

</p>





{/* memória aparecendo */}


<div className="
mt-8
h-14
relative
overflow-hidden
">


<motion.div

key={memory}

initial={{
opacity:0,
y:30,
scale:.8
}}

animate={{
opacity:1,
y:0,
scale:1
}}

className="
absolute
left-0
right-0
text-xl
text-pink-200
font-medium
"

>

<span>
&ldquo;{memories[memory]}&rdquo;
</span>

</motion.div>


</div>






{/* etapas */}


<div className="
mt-8
rounded-3xl
border
border-white/10
bg-white/5
backdrop-blur-xl
p-6
space-y-5
text-left
">


{
steps.map((step,index)=>{


const Icon = step.icon;


const active=index <= currentStep;


return (

<motion.div

key={step.text}

animate={{

opacity: active ? 1 : .35

}}

className="
flex
items-center
gap-4
"

>


<div className={`
w-9
h-9
rounded-full
flex
items-center
justify-center

${active
?
"bg-pink-500"
:
"bg-white/10"
}

`}>

{

index < currentStep

?

<Check size={16}/>

:

<Icon size={16}/>

}


</div>



<span>

{step.text}

</span>



</motion.div>


)


})

}


</div>






{/* barra de progresso */}


<div className="
mt-8
h-2
rounded-full
bg-white/10
overflow-hidden
">


<motion.div

animate={{

width:`${((currentStep+1)/steps.length)*100}%`

}}

transition={{

duration:1

}}

className="
h-full
bg-gradient-to-r
from-pink-400
to-purple-400
rounded-full
"

/>


</div>





<p className="
mt-4
text-sm
text-white/50
">

Preparando algo especial para você ❤️

</p>



</motion.div>



</section>

)

}