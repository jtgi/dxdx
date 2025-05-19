import React from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";

interface SearchFormProps {
  className?: string;
  defaultValue?: string;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const SearchForm = React.forwardRef<HTMLInputElement, SearchFormProps>(
  ({ className = "", defaultValue = "", onSubmit }, ref) => {
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const address = formData.get("address") as string;
      console.log(address);
      if (address) {
        navigate(`/${address}`);
      }
    };

    return (
      <form className={`flex gap-2 ${className}`} onSubmit={handleSubmit}>
        <Input
          ref={ref}
          type="text"
          name="address"
          defaultValue={defaultValue}
          className="bg-zinc-900 border-zinc-800 text-gray-300 w-[300px] md:w-[400px] selection:bg-orange-500/20 selection:text-orange-400"
          placeholder="Address or ENS..."
        />
        <Button type="submit" size="sm" variant="ghost" className="bg-white text-black hover:bg-zinc-200">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    );
  }
);
