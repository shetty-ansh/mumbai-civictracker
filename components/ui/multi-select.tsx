"use client";

import * as React from "react";
import { X, ChevronsUpDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
    CommandInput,
    CommandEmpty,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Option = {
    label: string;
    value: string;
    count?: number;
};

interface MultiSelectProps {
    options: Option[];
    selected: string[];
    onChange: (value: string[]) => void;
    className?: string;
    placeholder?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    className,
    placeholder = "Select options...",
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    // Filter out duplicate options just in case
    const uniqueOptions = options.filter(
        (option, index, self) =>
            index === self.findIndex((t) => t.value === option.value)
    );

    const handleUnselect = (item: string) => {
        onChange(selected.filter((i) => i !== item));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between h-auto min-h-10 px-3 py-2 hover:bg-muted/50 transition-colors",
                        className
                    )}
                >
                    <div className="flex flex-wrap gap-1 items-center">
                        {selected.length === 0 && (
                            <span className="text-muted-foreground font-normal">{placeholder}</span>
                        )}
                        {selected.length > 0 && selected.length <= 3 ? (
                            selected.map((item) => {
                                const label = uniqueOptions.find((opt) => opt.value === item)?.label || item;
                                return (
                                    <Badge
                                        key={item}
                                        variant="secondary"
                                        className="mr-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnselect(item);
                                        }}
                                    >
                                        {label}
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    handleUnselect(item);
                                                }
                                            }}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleUnselect(item);
                                            }}
                                        >
                                            <X className="h-3 w-3 text-yellow-800 hover:text-yellow-900" />
                                        </div>
                                    </Badge>
                                );
                            })
                        ) : selected.length > 3 ? (
                            <div className="flex gap-1">
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    {selected.length} selected
                                </Badge>
                                {/* Show a clear all "X" if many selected */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChange([]);
                                    }}
                                    className="flex items-center justify-center p-1 rounded-full hover:bg-stone-100 cursor-pointer"
                                >
                                    <X className="h-4 w-4 text-stone-400" />
                                </div>
                            </div>
                        ) : null}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="max-h-64 overflow-auto">
                            {uniqueOptions.map((option) => {
                                const isSelected = selected.includes(option.value);
                                return (
                                    <CommandItem
                                        key={option.value}
                                        onSelect={() => {
                                            const newSelected = isSelected
                                                ? selected.filter((item) => item !== option.value)
                                                : [...selected, option.value];
                                            onChange(newSelected);
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <div
                                            className={cn(
                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                isSelected
                                                    ? "bg-primary text-primary-foreground"
                                                    : "opacity-50 [&_svg]:invisible"
                                            )}
                                        >
                                            <Check className={cn("h-4 w-4")} />
                                        </div>
                                        <span>{option.label}</span>
                                        {option.count !== undefined && (
                                            <span className="ml-auto text-muted-foreground text-xs pl-2">
                                                {option.count}
                                            </span>
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {selected.length > 0 && (
                            <div className="flex flex-col border-t p-1">
                                <Button
                                    variant="ghost"
                                    className="justify-center text-xs h-8 w-full font-normal"
                                    onClick={() => onChange([])}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
