"use client";


import StorySlide from "@/components/story/StorySlide";
import AnimatedNumber from "@/components/story/AnimatedNumber";
import { Heart, MessageCircle, Moon } from "lucide-react";
import { motion } from "framer-motion";


export default function WrappedPage(){


return (

<main>



<StorySlide variant="pink">


<Heart

className="
mx-auto
w-24
h-24
fill-pink-400
text-pink-400
"

/>


<h1 className="
mt-8
text-5xl
font-bold
">

Nosso

<br/>


<span className="
bg-gradient-to-r
from-pink-300
to-purple-300
bg-clip-text
text-transparent
">

Love Wrapped

</span>


</h1>


<p className="
mt-8
text-white/70
text-lg
">

Uma história construída
em mensagens ❤️

</p>



<p className="
mt-10
text-pink-200
">

João & Maria

</p>


</StorySlide>






<StorySlide variant="purple">


<MessageCircle

className="
mx-auto
w-16
h-16
text-purple-300
"

/>



<p className="
mt-8
text-xl
text-white/60
">

Vocês trocaram...

</p>



<h2 className="
mt-4
text-7xl
font-bold
">

<AnimatedNumber

value={18532}

/>

</h2>



<p className="
mt-4
text-xl
">

mensagens ❤️

</p>



</StorySlide>






<StorySlide variant="dark">


<h2 className="
text-xl
text-white/60
">

A palavra mais especial foi...

</h2>


<motion.div>

</motion.div>


<p className="
mt-10
text-7xl
font-bold
bg-gradient-to-r
from-pink-400
to-purple-400
bg-clip-text
text-transparent
">

amor

</p>



<p className="
mt-6
text-white/70
">

Uma pequena palavra,
mas cheia de significado.

</p>



</StorySlide>






<StorySlide variant="purple">


<Moon

className="
mx-auto
w-20
h-20
text-blue-200
"

/>


<h2 className="
mt-8
text-4xl
font-bold
">

23:00

</h2>


<p className="
mt-4
text-white/60
">

O horário onde as melhores conversas aconteciam 🌙

</p>


</StorySlide>






<StorySlide variant="gold">


<Heart

className="
mx-auto
w-24
h-24
fill-pink-400
text-pink-400
"

/>



<h2 className="
mt-10
text-4xl
font-bold
">

Algumas histórias

<br/>

merecem ser lembradas.

</h2>



<button className="
mt-10
px-8
py-4
rounded-full
bg-pink-500
font-semibold
shadow-lg
shadow-pink-500/40
">

Compartilhar ❤️

</button>



</StorySlide>



</main>

)

}