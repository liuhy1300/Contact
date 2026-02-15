import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-md bg-white/5",
                className
            )}
            {...props}
        >
            <motion.div
                className="absolute inset-0 -translate-x-full"
                animate={{ translateX: ["100%"] }}
                transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "linear",
                    repeatDelay: 0.5
                }}
            >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </motion.div>
        </div>
    );
}
