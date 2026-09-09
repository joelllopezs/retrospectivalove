"use client";

import { motion } from "framer-motion";


interface StorySlideProps {

children: React.ReactNode;

variant?: 
"pink" |
"purple" |
"dark" |
"gold";

}


const backgrounds = {

pink:
"from-[#3b082f] via-[#8b1457] to-[#150018]",

purple:
"from-[#12051f] via-[#3b176d] to-[#05020a]",

dark:
"from-black via-[#16051f] to-black",

gold:
"from-[#3b2205] via-[#8b5a14] to-[#150800]"

};



export default function StorySlide({

children,

variant="purple"

}:StorySlideProps){


return (

<section className={`
min-h-screen
w-full
relative
overflow-hidden
flex
items-center
justify-center
px-6
bg-gradient-to-br
${backgrounds[variant]}
text-white
`}>



{/* Glow animado */}

<motion.div

animate={{

scale:[1,1.3,1],

opacity:[0.2,0.5,0.2]

}}

transition={{

duration:5,

repeat:Infinity

}}

className="
absolute
w-[400px]
h-[400px]
rounded-full
bg-pink-400/30
blur-[120px]
"


/>





{/* partículas */}

<div className="
absolute
inset-0
pointer-events-none
">


{

[
1,2,3,4,5,6
].map((item)=>(


<motion.div

key={item}

initial={{

y:"110vh",

opacity:0

}}

animate={{

y:"-20vh",

opacity:[0,1,0]

}}

transition={{

duration:8,

delay:item,

repeat:Infinity

}}

className="
absolute
text-pink-200/40
"

style={{

left:`${item*15}%`

}}

>

✦

</motion.div>


))


}


</div>






<motion.div

initial={{

opacity:0,

y:50,

scale:.95

}}

animate={{

opacity:1,

y:0,

scale:1

}}

transition={{

duration:1

}}

className="
relative
z-10
max-w-md
w-full
text-center
"

>


{children}


</motion.div>



</section>

)

}