import { NextRequest } from "next/server";
import { Session } from "freerdp3";

let session: Session | undefined = undefined;

export async function POST(req: NextRequest) {
  if (session) {
    const searchParams = req.nextUrl.searchParams;
    const [
      xParam,
      yParam,
      pressLeftParam,
      pressMiddleParam,
      pressRightParam,
      releaseLeftParam,
      releaseMiddleParam,
      releaseRightParam,
    ] = [
      searchParams.get("x"),
      searchParams.get("y"),
      searchParams.get("pressLeft"),
      searchParams.get("pressMiddle"),
      searchParams.get("pressRight"),
      searchParams.get("releaseLeft"),
      searchParams.get("releaseMiddle"),
      searchParams.get("releaseRight"),
    ];
    const [
      x,
      y,
      pressLeft,
      pressMiddle,
      pressRight,
      releaseLeft,
      releaseMiddle,
      releaseRight,
    ] = [
      parseInt(xParam || "0"),
      parseInt(yParam || "0"),
      pressLeftParam === "true" ? true : false,
      pressMiddleParam === "true" ? true : false,
      pressRightParam === "true" ? true : false,
      releaseLeftParam === "true" ? true : false,
      releaseMiddleParam === "true" ? true : false,
      releaseRightParam === "true" ? true : false,
    ];
    console.log(x, y, pressLeft, pressMiddle, pressRight);
    session.sendPointerEvent(x, y, {
      pressLeft,
      pressMiddle,
      pressRight,
      releaseLeft,
      releaseMiddle,
      releaseRight,
    });
  }
  return new Response(undefined);
}
