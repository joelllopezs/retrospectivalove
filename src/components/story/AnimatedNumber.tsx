"use client";

import { useEffect, useState } from "react";


interface AnimatedNumberProps {

value:number;

duration?:number;

}


export default function AnimatedNumber({

value,

duration=2000

}:AnimatedNumberProps){


const [count,setCount]=useState(0);



useEffect(()=>{


let start = 0;

const increment = value / (duration / 30);


const timer=setInterval(()=>{


start += increment;


if(start >= value){

setCount(value);

clearInterval(timer);

}

else{

setCount(Math.floor(start));

}


},30);



return ()=>clearInterval(timer);


},[value,duration]);



return (

<span>

{count.toLocaleString("pt-BR")}

</span>

)

}