import { NextResponse } from "next/server";
import {
  del,
  get,
} from "@vercel/blob";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;

    if (
      !slug ||
      !/^[a-z0-9-]+$/i.test(slug)
    ) {
      return NextResponse.json(
        {
          error: "Slug inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const result = await get(
      `stories/${slug}.json`,
      {
        access: "private",
        useCache: false,
      }
    );

    if (!result) {
      return NextResponse.json(
        {
          error:
            "História não encontrada.",
        },
        {
          status: 404,
        }
      );
    }

    return new Response(result.stream, {
      status: 200,
      headers: {
        "Content-Type":
          "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(
      "Erro ao buscar história:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível carregar a história.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;

    await del(
      `stories/${slug}.json`
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro ao remover história:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível remover a história.",
      },
      {
        status: 500,
      }
    );
  }
}