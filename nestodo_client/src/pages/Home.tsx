import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-6xl font-bold">nestodo</h1>
            <p className="text-lg text-gray-500 mt-2">A simple task management application built with Nest.js and React</p>
            <div className="flex gap-2 mt-4">
                <Button asChild>
                    <Link to="/register">Get started</Link>
                </Button>
            </div>
        </div>
    );
}