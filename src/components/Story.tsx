"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type TouchEvent,
} from "react";

import {
  CoverSlide,
  CounterSlide,
  OverviewSlide,
  TalkerSlide,
  LoveSlide,
  EmojiSlide,
  MomentsSlide,
  HourlySlide,
  PersonalitySlide,
  AwardsSlide,
  LetterSlide,
} from "@/components/story/slides";

import {
  QuizIntroSlide,
  QuizSlide,
} from "@/components/story/QuizSlides";

import { buildQuizQuestions } from "@/lib/quiz";

import { AudioController } from "@/components/story/AudioController";

import type { AnalysisResult } from "@/types/analysis";

import type { PhotoMoment } from "@/lib/photos";



interface SlideDef {
  id: string;

  duration: number | null;

  render: (
    result: AnalysisResult,
    onReset: () => void
  ) => React.ReactNode;
}



function buildSlides(
  result: AnalysisResult,
  photos: PhotoMoment[],
  relationshipStart: Date | null,
  onReset: () => void
): SlideDef[] {


  const slides: SlideDef[] = [

    {
      id: "cover",

      duration: 3500,

      render: (r) => (
        <CoverSlide result={r} />
      ),
    },

  ];



  if (relationshipStart) {

    slides.push({

      id: "counter",

      duration: 6000,

      render: () => (

        <CounterSlide
          startDate={relationshipStart}
        />

      ),

    });

  }





  slides.push(

    {

      id: "overview",

      duration: 5000,

      render: (r) => (

        <OverviewSlide
          result={r}
        />

      ),

    },


    {

      id: "talker",

      duration: 5000,

      render: (r) => (

        <TalkerSlide
          result={r}
        />

      ),

    },


    {

      id: "love",

      duration: 5500,

      render: (r) => (

        <LoveSlide
          result={r}
        />

      ),

    },


    {

      id: "emoji",

      duration: 5000,

      render: (r) => (

        <EmojiSlide
          result={r}
        />

      ),

    }

  );



  if (photos.length > 0) {

    slides.push({

      id: "moments",

      duration: 5500,

      render: () => (

        <MomentsSlide
          photos={photos}
        />

      ),

    });

  }



  slides.push({

    id: "hourly",

    duration: 5000,

    render: (r) => (

      <HourlySlide
        result={r}
      />

    ),

  });



  const quizQuestions =
    buildQuizQuestions(result);



  if (quizQuestions.length > 0) {


    slides.push({

      id: "quiz-intro",

      duration: 2500,

      render: () => (

        <QuizIntroSlide />

      ),

    });


    quizQuestions.forEach(
      (question, i) => {


        slides.push({

          id: `quiz-${question.id}`,

          duration: null,

          render: () => (

            <QuizSlide

              question={question}

              index={i}

              total={
                quizQuestions.length
              }

            />

          ),

        });


      }
    );

  }
  slides.push(

    {

      id: "personality",

      duration: 6000,

      render: (r) => (

        <PersonalitySlide
          result={r}
        />

      ),

    },


    {

      id: "awards",

      duration: 6500,

      render: (r) => (

        <AwardsSlide
          result={r}
        />

      ),

    },


    {

      id: "letter",

      duration: null,

      render: (r) => (

        <LetterSlide

          result={r}

          onReset={onReset}

        />

      ),

    }


  );



  return slides;

}





const SWIPE_THRESHOLD = 40;





export function Story({

  result,

  photos,

  relationshipStart = null,

  backgroundPhotoUrl = null,

  onExit,

  onReset,

}: {

  result: AnalysisResult;

  photos: PhotoMoment[];

  relationshipStart?: Date | null;

  backgroundPhotoUrl?: string | null;

  onExit: () => void;

  onReset: () => void;

}) {



  const slides = useMemo(

    () =>

      buildSlides(

        result,

        photos,

        relationshipStart,

        onReset

      ),

    [

      result,

      photos,

      relationshipStart,

      onReset,

    ]

  );



  const [index, setIndex] =
    useState(0);



  const touchStartX =
    useRef<number | null>(null);



  const touchStartY =
    useRef<number | null>(null);




  const goNext = useCallback(() => {


    setIndex((current) =>

      Math.min(

        current + 1,

        slides.length - 1

      )

    );


  }, [slides.length]);





  const goPrev = useCallback(() => {


    setIndex((current) =>

      Math.max(

        current - 1,

        0

      )

    );


  }, []);





  useEffect(() => {


    const currentSlide =
      slides[index];



    if (!currentSlide) {
      return;
    }



    if (
      currentSlide.duration === null
    ) {

      return;

    }



    if (
      index === slides.length - 1
    ) {

      return;

    }



    const timer =
      window.setTimeout(

        goNext,

        currentSlide.duration

      );



    return () => {

      window.clearTimeout(timer);

    };


  }, [

    index,

    slides,

    goNext,

  ]);





  useEffect(() => {


    function handleKey(
      event: KeyboardEvent
    ) {


      if (
        event.key === "ArrowRight"
      ) {

        goNext();

      }



      if (
        event.key === "ArrowLeft"
      ) {

        goPrev();

      }



      if (
        event.key === "Escape"
      ) {

        onExit();

      }


    }



    window.addEventListener(

      "keydown",

      handleKey

    );



    return () =>

      window.removeEventListener(

        "keydown",

        handleKey

      );


  }, [

    goNext,

    goPrev,

    onExit,

  ]);

  const isInteractiveElement = (

    target: EventTarget | null

  ) => {


    if (!(target instanceof HTMLElement)) {

      return false;

    }



    return Boolean(

      target.closest(

        [

          "button",

          "a",

          "input",

          "textarea",

          "select",

          "label",

          "[role='button']",

          "[data-story-interactive]",

        ].join(",")

      )

    );

  };






  const handleContainerClick = (

    event: MouseEvent<HTMLDivElement>

  ) => {



    if (

      isInteractiveElement(

        event.target

      )

    ) {

      return;

    }




    const rect =

      event.currentTarget

        .getBoundingClientRect();




    const position =

      (

        event.clientX -

        rect.left

      ) /

      rect.width;





    if (position < 0.35) {

      goPrev();

    } else {

      goNext();

    }


  };






  const handleTouchStart = (

    event: TouchEvent<HTMLDivElement>

  ) => {


    const touch =
      event.touches[0];



    touchStartX.current =
      touch.clientX;



    touchStartY.current =
      touch.clientY;


  };







  const handleTouchEnd = (

    event: TouchEvent<HTMLDivElement>

  ) => {


    if (

      touchStartX.current === null ||

      touchStartY.current === null

    ) {

      return;

    }





    const touch =
      event.changedTouches[0];




    const deltaX =

      touch.clientX -

      touchStartX.current;




    const deltaY =

      touch.clientY -

      touchStartY.current;





    touchStartX.current = null;

    touchStartY.current = null;





    if (

      Math.abs(deltaY) >

      Math.abs(deltaX)

    ) {

      return;

    }





    if (

      Math.abs(deltaX) <

      SWIPE_THRESHOLD

    ) {

      return;

    }





    if (deltaX < 0) {

      goNext();

    } else {

      goPrev();

    }


  };






  const currentSlide =
    slides[index];


  return (

    <div
      className={`
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/85
        p-0
        backdrop-blur-md
        sm:p-6
      `}
    >


      <div
        className={`
          relative
          h-full
          w-full
          overflow-hidden
          bg-ink
          sm:h-[780px]
          sm:max-h-[90vh]
          sm:w-[390px]
          sm:rounded-[36px]
          sm:shadow-2xl
          sm:ring-1
          sm:ring-paper/10
        `}
      >


        {
          backgroundPhotoUrl && (

            <div

              className={`
                absolute
                -inset-6
                scale-110
                bg-cover
                bg-center
              `}

              style={{
                backgroundImage:
                  `url(${backgroundPhotoUrl})`,
              }}

            />

          )
        }



        <div

          className={`
            absolute
            inset-0
          `}

          style={{
            background:
              backgroundPhotoUrl

                ? "linear-gradient(180deg, rgba(20,10,15,.45), rgba(20,10,15,.92))"

                : "radial-gradient(circle at top, rgba(255,120,165,.25), transparent 40%)",
          }}

        />





        <div
          className={`
            absolute
            inset-x-3
            top-3
            z-30
            flex
            gap-1.5
          `}
        >

          {
            slides.map(
              (slide, slideIndex) => (

                <div

                  key={slide.id}

                  className={`
                    h-1
                    flex-1
                    overflow-hidden
                    rounded-full
                    bg-paper/20
                  `}

                >

                  {
                    slideIndex < index && (

                      <div
                        className={`
                          h-full
                          w-full
                          rounded-full
                          bg-paper
                        `}
                      />

                    )
                  }


                  {
                    slideIndex === index && (

                      <div
                        className={`
                          h-full
                          w-full
                          rounded-full
                          bg-paper
                        `}
                      />

                    )
                  }


                </div>

              )
            )
          }

        </div>





        <div

          data-story-interactive

          className={`
            absolute
            left-3
            top-7
            z-40
          `}

        >

          <AudioController autoPlay />

        </div>





        <button

          type="button"

          data-story-interactive

          onClick={onExit}

          aria-label="Fechar"

          className={`
            absolute
            right-3
            top-7
            z-40
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-black/30
            text-lg
            text-paper
          `}

        >

          ×

        </button>







        <div

          className={`
            relative
            z-10
            h-full
            w-full
          `}

          onClick={
            handleContainerClick
          }

          onTouchStart={
            handleTouchStart
          }

          onTouchEnd={
            handleTouchEnd
          }

        >



          <div

            key={
              currentSlide.id
            }

            className={`
              h-full
              w-full
              pt-10
            `}

          >

            {
              currentSlide.render(
                result,
                onReset
              )
            }


          </div>



        </div>





      </div>



      <style jsx global>{`

        @keyframes story-slide-enter {

          from {

            opacity:0;

            transform:
              translateY(20px)
              scale(.98);

          }


          to {

            opacity:1;

            transform:
              translateY(0)
              scale(1);

          }

        }


      `}</style>


    </div>

  );

}