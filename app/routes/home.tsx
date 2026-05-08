import type { Route } from "./+types/home";
import { BracketView } from "../bracket/BracketView";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "토너먼트 생성기" },
    {
      name: "description",
      content: "싱글 엘리미네이션 토너먼트 생성기",
    },
  ];
}

export default function Home() {
  return <BracketView />;
}
