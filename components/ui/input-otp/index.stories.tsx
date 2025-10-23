import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./index";

const meta: Meta<typeof InputOTP> = {
  title: "UI/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="font-semibold text-lg">Enter Verification Code</h3>
        <InputOTP
          maxLength={6}
          value={value}
          onChange={val => setValue(val)}
          containerClassName="gap-3"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <p className="text-sm text-muted-foreground">
          Value: <span className="font-mono">{value || "------"}</span>
        </p>
      </div>
    );
  },
};

export const OneGroup: Story = {
  render: () => {
    const [value, setValue] = useState("");

    return (
      <div className="flex flex-col items-center justify-center gap-4 py-10">
        <h3 className="font-semibold text-lg">Enter Verification Code</h3>
        <InputOTP
          maxLength={6}
          value={value}
          onChange={val => setValue(val)}
          containerClassName="gap-3"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <p className="text-sm text-muted-foreground">
          Value: <span className="font-mono">{value || "------"}</span>
        </p>
      </div>
    );
  },
};
