import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Users } from "lucide-react";

interface GuestNamesFormProps {
  quantity: number;
  onGuestNamesChange: (guestNames: string[]) => void;
  guestNames: string[];
}

export const GuestNamesForm = ({ quantity, onGuestNamesChange, guestNames }: GuestNamesFormProps) => {
  const [nameInputs, setNameInputs] = useState<string[]>(
    guestNames.length > 0 ? guestNames : Array(quantity).fill("")
  );

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...nameInputs];
    newNames[index] = value;
    setNameInputs(newNames);
    onGuestNamesChange(newNames);
  };

  const addGuestField = () => {
    const newNames = [...nameInputs, ""];
    setNameInputs(newNames);
    onGuestNamesChange(newNames);
  };

  const removeGuestField = (index: number) => {
    if (nameInputs.length > 1) {
      const newNames = nameInputs.filter((_, i) => i !== index);
      setNameInputs(newNames);
      onGuestNamesChange(newNames);
    }
  };

  const validateNames = () => {
    const filledNames = nameInputs.filter(name => name.trim().length > 0);
    const uniqueNames = new Set(filledNames.map(name => name.trim().toLowerCase()));
    
    return {
      hasEmptyNames: filledNames.length < quantity,
      hasDuplicates: uniqueNames.size !== filledNames.length,
      validNames: filledNames
    };
  };

  const { hasEmptyNames, hasDuplicates, validNames } = validateNames();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Guest Names ({quantity} ticket{quantity > 1 ? 's' : ''})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Please provide the full name for each guest. Names must be unique.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {nameInputs.map((name, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor={`guest-${index}`} className="sr-only">
                Guest {index + 1} Name
              </Label>
              <Input
                id={`guest-${index}`}
                placeholder={`Guest ${index + 1} full name`}
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                className={`
                  ${name.trim() && nameInputs.filter(n => n.trim().toLowerCase() === name.trim().toLowerCase()).length > 1 
                    ? 'border-destructive focus:ring-destructive' 
                    : ''
                  }
                `}
              />
              {name.trim() && nameInputs.filter(n => n.trim().toLowerCase() === name.trim().toLowerCase()).length > 1 && (
                <p className="text-xs text-destructive mt-1">Duplicate name</p>
              )}
            </div>
            {nameInputs.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeGuestField(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {nameInputs.length < 20 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addGuestField}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Guest
          </Button>
        )}

        {hasEmptyNames && (
          <p className="text-sm text-destructive">
            Please fill in all guest names (minimum {quantity} names required)
          </p>
        )}

        {hasDuplicates && (
          <p className="text-sm text-destructive">
            Each guest name must be unique within this order
          </p>
        )}

        <div className="text-sm text-muted-foreground">
          Valid names: {validNames.length} / {quantity} required
        </div>
      </CardContent>
    </Card>
  );
};