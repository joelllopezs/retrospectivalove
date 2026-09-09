"use client";

import { motion } from "framer-motion";


const hearts = [
  {
    x: 10,
    duration: 10,
    delay: 0,
    size: 20
  },
  {
    x: 25,
    duration: 14,
    delay: 2,
    size: 28
  },
  {
    x: 40,
    duration: 9,
    delay: 1,
    size: 18
  },
  {
    x: 55,
    duration: 13,
    delay: 3,
    size: 32
  },
  {
    x: 70,
    duration: 11,
    delay: 1.5,
    size: 22
  },
  {
    x: 85,
    duration: 15,
    delay: 4,
    size: 26
  },
  {
    x: 15,
    duration: 12,
    delay: 5,
    size: 24
  },
  {
    x: 60,
    duration: 10,
    delay: 6,
    size: 30
  }
];


export default function FloatingHearts(){


return (

<div className="
absolute
inset-0
overflow-hidden
pointer-events-none
">


{
hearts.map((heart,index)=>(


<motion.div

key={index}

initial={{
y:"100vh",
x:`${heart.x}vw`,
opacity:0
}}

animate={{

y:"-20vh",

opacity:[
0,
1,
1,
0
],

rotate:[
0,
20,
-20,
0
]

}}

transition={{

duration:heart.duration,

delay:heart.delay,

repeat:Infinity,

ease:"linear"

}}

style={{

fontSize:`${heart.size}px`

}}

className="
absolute
text-pink-400
"

>

❤️

</motion.div>


))

}


</div>

)

}