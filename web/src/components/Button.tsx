import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
    size?: "sm" | "md" | "lg" | "icon";
    isLoading?: boolean;
    href?: string;
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className = "",
            variant = "primary",
            size = "md",
            isLoading = false,
            href,
            fullWidth = false,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const baseStyles =
            "inline-flex items-center justify-center rounded-full font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-95";

        const variants = {
            primary:
                "bg-primary text-white hover:bg-primary-light shadow-lg shadow-primary/30 border border-transparent",
            secondary:
                "bg-surface-elevated text-text-main hover:bg-surface border border-surface-elevated hover:border-surface-elevated/80",
            outline:
                "bg-transparent border-2 border-primary text-primary hover:bg-primary/10",
            ghost: "bg-transparent text-text-main hover:bg-surface-elevated/50",
            link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-base",
            icon: "h-10 w-10",
        };

        const classes = [
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth ? "w-full" : "",
            className,
        ]
            .filter(Boolean)
            .join(" ");

        const content = (
            <>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </>
        );

        if (href) {
            return (
                <Link href={href} className={classes}>
                    {content}
                </Link>
            );
        }

        return (
            <button
                ref={ref}
                className={classes}
                disabled={disabled || isLoading}
                {...props}
            >
                {content}
            </button>
        );
    }
);

Button.displayName = "Button";
