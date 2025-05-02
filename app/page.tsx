import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full min-h-screen flex flex-col">
      <nav className="flex items-center justify-center p-4 w-full">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold">Darpan</span>
          </div>
        </Link>
      </nav>
      <div className="container md:flex justify-center items-center px-4 md:px-6 mx-auto  flex-1">
        <div className="flex flex-col items-center space-y-4 text-center p-4 md:w-1/2">
          <h1 className="text-balance text-4xl font-semibold md:text-5xl lg:text-6xl">
            A{" "}
            <span className="bg-gradient-to-r from-orange-700 via-blue-500 to-green-400 text-transparent bg-clip-text bg-300% animated-gradient">
              Modern Configurator
            </span>
            {} to Unleash your <br /> Creativity
          </h1>

          <p className="text-muted-foreground mt-2 mb-6">
            Made with ❤ by <span className=" font-bold mt-2">Nisya Studio</span>
          </p>

          <Button asChild>
            <Link href="/studio">Explore</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
