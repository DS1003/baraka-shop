import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Container({ className, ...props }: ContainerProps) {
    return (
        <div
            className={cn(
                "mx-auto w-full max-w-[1500px] px-4 md:px-6 lg:px-8",
                className
            )}
            {...props}
        />
    )
}
