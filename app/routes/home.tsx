import type { Route } from "./+types/home";
import { BracketView } from "../bracket/BracketView";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "토너먼트 브라킷" },
    {
      name: "description",
      content: "싱글 엘리미네이션 토너먼트 브라킷 매니저",
    },
  ];
}

export default function Home() {
  return <BracketView />;
}
