import { UserButton } from "@clerk/nextjs";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

type Props = {};
export default function Home({}: Props) {
  return (
    <div className="p-10 flex flex-col bg-white text-black dark:bg-slate-800 dark:text-white h-full gap-5">
      <div className="text-5xl font-bold">Welcome to Docbox</div>
      <div className="text-3xl font-medium">
        Storing everthing for you in one place.
      </div>
      <Link
        href={"/dashboard"}
        className="flex px-3 py-2 bg-green-500 text-white rounded-md hover:opacity-50 mr-auto"
      >
        <div>Get Started</div>
        <ArrowRightIcon className="ml-2" />
      </Link>
    </div>
  );
}
