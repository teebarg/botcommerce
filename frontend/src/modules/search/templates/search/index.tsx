"use client";

import React from "react";
import { Kbd } from "@nextui-org/kbd";
import { MagnifyingGlassMini } from "nui-react-icons";
import { SEARCH_INDEX_NAME, searchClient } from "@lib/search-client";
import Hit from "@modules/search/components/hit";
import Hits from "@modules/search/components/hits";
import { InstantSearch } from "react-instantsearch-hooks-web";
import SearchInput from "@modules/search/components/search-input";
import Button from "@modules/common/components/button";
import { useOverlayTriggerState } from "react-stately";
import { Modal } from "@modules/common/components/modal";

export default function Search() {
    const modalState = useOverlayTriggerState({});

    return (
        <React.Fragment>
            <Button color="default" endContent={<Kbd keys={["command"]}>K</Kbd>} startContent={<MagnifyingGlassMini />} onPress={modalState.open}>
                Search products, brands and categories...
            </Button>
            {modalState.isOpen && (
                <Modal hasX={false} size="lg" onClose={modalState.close}>
                    <InstantSearch indexName={SEARCH_INDEX_NAME} searchClient={searchClient}>
                        <div className="flex items-center w-full px-4 border-b border-default-400/50 dark:border-default-100">
                            <MagnifyingGlassMini />
                            <SearchInput />
                            <Kbd
                                className="hidden md:block border-none px-2 py-1 ml-2 font-medium text-[0.6rem] cursor-pointer"
                                onClick={modalState.close}
                            >
                                ESC
                            </Kbd>
                        </div>
                        <div className="max-h-[70vh] min-h-[70vh] overflow-y-auto">
                            <Hits hitComponent={Hit} />
                        </div>
                    </InstantSearch>
                </Modal>
            )}
        </React.Fragment>
    );
}
