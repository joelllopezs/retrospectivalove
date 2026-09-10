"use client";

import { useEffect, useState } from "react";


import { UploadConversation } from "@/components/UploadConversation";
import { RelationshipStartForm } from "@/components/RelationshipStartForm";
import { Processing } from "@/components/Processing";
import { Statistics } from "@/components/Statistics";
import { Story } from "@/components/Story";
import { WaxSeal } from "@/components/WaxSeal";


import {
  revokePhotoMoments,
  type PhotoMoment,
} from "@/lib/photos";


import { createStory } from "@/lib/story/createStory";
import { saveStory } from "@/lib/storage/storyStorage";


import type { AnalysisResult } from "@/types/analysis";
import type { StoryData } from "@/types/story";



type Stage =
  | "upload"
  | "relationship"
  | "processing"
  | "done";



type RelationshipData = {
  type: "dating" | "marriage";
  date: Date;
};





export default function Home() {


  const [stage, setStage] =
    useState<Stage>("upload");



  const [file, setFile] =
    useState<File | null>(null);



  const [result, setResult] =
    useState<AnalysisResult | null>(null);



  const [photos, setPhotos] =
    useState<PhotoMoment[]>([]);



  const [story, setStory] =
    useState<StoryData | null>(null);



  const [isStoryOpen, setIsStoryOpen] =
    useState(false);



  const [
    relationshipData,
    setRelationshipData,
  ] =
    useState<RelationshipData | null>(
      null
    );





  const handleFileAccepted = (
    selected: File
  ) => {

    setFile(selected);

    setStage("relationship");

  };





  const handleRelationshipComplete = (
    data: RelationshipData
  ) => {

    setRelationshipData(data);

    setStage("processing");

  };





  /**
   * Finalização da análise.
   *
   * Cria a história e salva no Blob.
   */
  const handleComplete = async (

    analysis: AnalysisResult,

    newPhotos: PhotoMoment[]

  ) => {


    const newStory = createStory(

      analysis,

      newPhotos,

      relationshipData

    );



    await saveStory(newStory);



    setStory(newStory);


    setResult(analysis);


    setPhotos(newPhotos);


    setStage("done");

  };
    const handleReset = () => {

    revokePhotoMoments(photos);


    setStage("upload");


    setFile(null);


    setResult(null);


    setPhotos([]);


    setStory(null);


    setRelationshipData(null);


    setIsStoryOpen(false);

  };





  return (

    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16">


      <div

        aria-hidden="true"

        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/3
          h-[560px]
          w-[560px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          opacity-40
          blur-3xl
        "

        style={{

          background:
            "radial-gradient(circle, var(--rose) 0%, transparent 70%)",

        }}

      />





      {stage === "done" && result ? (

        <div className="relative">


          <Statistics

            result={result}

            photos={photos}

            story={story}

            showShare={true}

            onReset={handleReset}

            onOpenStory={() =>
              setIsStoryOpen(true)
            }

          />


        </div>


      ) : (


        <div className="relative w-full max-w-md">


          <WaxSeal
            className="mx-auto mb-6 h-14 w-14"
          />



          <h1 className="text-center font-display text-5xl italic tracking-tight text-paper">

            Love Wrapped

          </h1>



          <p className="mx-auto mt-4 max-w-xs text-center font-body text-base leading-relaxed text-muted">

            A conversa de vocês,
            transformada em uma
            retrospectiva da história
            que construíram juntos.

          </p>




          <div className="mt-10 -rotate-1 rounded-[32px] bg-wine p-2 shadow-2xl shadow-black/40">


            <div className="rotate-1">


              {stage === "upload" && (

                <UploadConversation

                  onFileAccepted={
                    handleFileAccepted
                  }

                />

              )}






              {stage === "relationship" &&
                file && (


                  <div className="rounded-[26px] bg-ink/40 p-6 backdrop-blur-sm">


                    <RelationshipStartForm

                      onComplete={
                        handleRelationshipComplete
                      }

                    />



                    <button

                      type="button"

                      onClick={() => {

                        setFile(null);

                        setRelationshipData(null);

                        setStage("upload");

                      }}

                      className="
                        mt-5
                        w-full
                        text-center
                        font-body
                        text-xs
                        text-muted
                        transition-colors
                        hover:text-paper
                      "

                    >

                      ← Escolher outro arquivo

                    </button>


                  </div>


                )}






              {stage === "processing" &&
                file && (


                  <Processing

                    file={file}

                    onComplete={
                      handleComplete
                    }

                    onReset={
                      handleReset
                    }

                  />


                )}



            </div>


          </div>
                    {stage === "upload" && (

            <p className="
              mx-auto
              mt-6
              max-w-sm
              text-center
              font-body
              text-sm
              text-muted
            ">

              Exporte a conversa no
              WhatsApp e envie o .txt
              ou .zip aqui. Tudo é
              processado no seu
              navegador.

            </p>

          )}



          {stage === "relationship" && (

            <p className="
              mx-auto
              mt-6
              max-w-sm
              text-center
              font-body
              text-sm
              text-muted
            ">

              ❤️ Essa data será usada
              para mostrar há quanto
              tempo vocês estão juntos.

            </p>

          )}



          {stage === "processing" &&
            relationshipData && (

              <p className="
                mx-auto
                mt-6
                max-w-sm
                text-center
                font-body
                text-sm
                text-muted
              ">

                {
                  relationshipData.type === "dating"

                    ? "💕 Preparando a retrospectiva do namoro..."

                    : "💍 Preparando a retrospectiva do casamento..."
                }

              </p>

            )}


        </div>

      )}





      {
        isStoryOpen &&
        result && (

          <Story

            result={result}

            photos={photos}


            relationshipStart={
              relationshipData?.date ?? null
            }


            onExit={() =>
              setIsStoryOpen(false)
            }


            onReset={handleReset}

          />

        )
      }



    </main>

  );

}