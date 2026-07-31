import { useState } from "react";
import { ButtonBase } from "@lastshotlabs/snapshot/ui/button";
import { CardBase } from "@lastshotlabs/snapshot/ui/card";
import { InputField } from "@lastshotlabs/snapshot/ui/input";

export function SettingsExample() {
  const [displayName, setDisplayName] = useState("");
  return (
    <CardBase title="Profile settings">
      <InputField
        label="Display name"
        value={displayName}
        onChange={setDisplayName}
      />
      <ButtonBase label="Save profile" type="submit" />
    </CardBase>
  );
}
