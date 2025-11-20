"use client";

import { useOverlayTriggerState } from "@react-stately/overlays";

import { Input } from "./ui/input";

import { Button } from "@/components/ui/button";
import Overlay from "@/components/overlay";

export const TestOverlay = () => {
    const state = useOverlayTriggerState({});

    return (
        <Overlay
            open={state.isOpen}
            sheetClassName="min-w-[30vw]"
            title="Cart Details"
            trigger={
                <Button variant="contrast" onClick={state.open}>
                    View Test Overlay
                </Button>
            }
            onOpenChange={state.setOpen}
        >
            <div className="bg-green-500">
                <div className="space-y-4 px-2">
                    <p>Test Overlay</p>
                    <Input />
                    <Input />
                    {/* <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input /> */}
                    <Button variant="outline">Last button</Button>
                </div>
                <div className="sticky bg-blue-500 w-full py-4 px-2 bottom-0 left-0">
                    <Button>hhhhhhh</Button>
                </div>
            </div>
        </Overlay>
    );
};
