import { expect, test } from "bun:test";

import { isUploadedMaterial, USER_CONTENT_RESET, generationTraceKeys } from "../src/lib/canvas/canvas-generation-defaults";
import { CanvasNodeType, type CanvasNodeData, type CanvasNodeMetadata } from "../src/types/canvas";

function imageNode(metadata: CanvasNodeMetadata): CanvasNodeData {
    return { id: "node", type: CanvasNodeType.Image, title: "image", position: { x: 0, y: 0 }, width: 340, height: 240, metadata };
}

test("classifies content saved before userContent existed by its own metadata", () => {
    // An image uploaded (or pasted) before the flag existed: content and no generation trace.
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", storageKey: "k", status: "success" }))).toBe(true);
});

test("keeps generated content out of the uploaded-material rule", () => {
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", model: "gpt-image-2" }))).toBe(false);
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", generationType: "generation" }))).toBe(false);
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", generationSnapshot: { mode: "image", params: {}, prompt: "p", referenceNodeIds: [] } }))).toBe(false);
    expect(isUploadedMaterial(imageNode({ content: "text", texts: [] }))).toBe(false);
});

test("ignores leftovers that an upload can carry", () => {
    // A size picked in the panel and an emptied images array survive on uploaded content.
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", size: "1024x1024", images: [] }))).toBe(true);
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", size: "1024x1024", images: [{ id: "a", status: "success", content: "x", naturalWidth: 1, naturalHeight: 1, bytes: 1, mimeType: "image/png" }] }))).toBe(true);
});

test("still treats content with only a prompt as uploaded material", () => {
    // Typing a prompt into an uploaded node must not make it look like generated content.
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", prompt: "a cat" }))).toBe(true);
});

test("lets an explicit userContent flag win over the metadata", () => {
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", model: "gpt-image-2", userContent: true }))).toBe(true);
    expect(isUploadedMaterial(imageNode({ content: "data:image/png;base64,AAA", userContent: false }))).toBe(false);
});

test("treats a replaced node as uploaded material", () => {
    const generated: CanvasNodeMetadata = {
        content: "data:image/png;base64,AAA",
        model: "gpt-image-2",
        size: "1024x1024",
        quality: "high",
        count: 4,
        generationType: "generation",
        images: [{ id: "a", status: "success", content: "x", naturalWidth: 1, naturalHeight: 1, bytes: 1, mimeType: "image/png" }],
        primaryImageId: "a",
        generationSnapshot: { mode: "image", params: {}, prompt: "p", referenceNodeIds: [] },
        prompt: "a cat",
    };
    const replaced = { ...generated, ...USER_CONTENT_RESET, userContent: true } as CanvasNodeMetadata;
    expect(generationTraceKeys(replaced)).toEqual([]);
    expect(isUploadedMaterial(imageNode(replaced))).toBe(true);
});

test("treats a replaced node as uploaded material without relying on the flag", () => {
    const generated: CanvasNodeMetadata = {
        content: "text",
        generationType: "generation",
        texts: [{ id: "t", content: "hi", status: "success" }],
        primaryTextId: "t",
        generationSnapshot: { mode: "text", params: {}, prompt: "p", referenceNodeIds: [] },
    };
    expect(isUploadedMaterial(imageNode({ ...generated, ...USER_CONTENT_RESET }))).toBe(true);
});

test("ignores nodes without content", () => {
    expect(isUploadedMaterial(imageNode({ status: "idle" }))).toBe(false);
    expect(isUploadedMaterial(imageNode({ prompt: "a cat" }))).toBe(false);
});
