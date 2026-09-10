import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import type { StoryData } from "@/types/story";

export async function POST(
  request: Request
) {
  try {
    const story =
      (await request.json()) as StoryData;

    if (
      !story?.slug ||
      !/^[a-z0-9-]+$/i.test(story.slug)
    ) {
      return NextResponse.json(
        {
          error:
            "Slug da história inválido.",
        },
        {
          status: 400,
        }
      );
    }

    await put(
      `stories/${story.slug}.json`,
      JSON.stringify(story),
      {
        access: "private",
        contentType:
          "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      }
    );

    return NextResponse.json({
      success: true,
      slug: story.slug,
    });
  } catch (error) {
    console.error(
      "Erro ao salvar história:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível salvar a história.",
      },
      {
        status: 500,
      }
    );
  }
}