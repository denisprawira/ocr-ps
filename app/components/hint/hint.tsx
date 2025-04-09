import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  title?: string;
}

export default function Hint({ children, title, content }: TooltipProps) {
  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent>
        {title && <p className="mb-4">{title}</p>}
        {content}
      </PopoverContent>
    </Popover>
  );
}
