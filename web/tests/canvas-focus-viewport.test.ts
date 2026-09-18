import { expect, test } from "bun:test";

import { focusViewportForNode } from "../src/lib/canvas/canvas-node-geometry";

// Mirrors the canvas transform: screen = viewport.offset + world * viewport.k, origin at top-left.
function projectPoint(world: { x: number; y: number }, viewport: { x: number; y: number; k: number }) {
    return { x: viewport.x + world.x * viewport.k, y: viewport.y + world.y * viewport.k };
}

function nodeCenter(node: { position: { x: number; y: number }; width: number; height: number }) {
    return { x: node.position.x + node.width / 2, y: node.position.y + node.height / 2 };
}

test("places the node center exactly at the viewport center", () => {
    const size = { width: 900, height: 600 };
    const node = { position: { x: 1234, y: -567 }, width: 340, height: 240 };
    const viewport = focusViewportForNode(node, size);
    const screen = projectPoint(nodeCenter(node), viewport);
    expect(screen.x).toBeCloseTo(size.width / 2, 6);
    expect(screen.y).toBeCloseTo(size.height / 2, 6);
});

test("still centers a node much larger than the viewport when the zoom is clamped to the minimum", () => {
    const size = { width: 1000, height: 800 };
    const node = { position: { x: 40, y: 80 }, width: 20000, height: 20000 };
    const viewport = focusViewportForNode(node, size);
    expect(viewport.k).toBe(0.05);
    const screen = projectPoint(nodeCenter(node), viewport);
    expect(screen.x).toBeCloseTo(size.width / 2, 6);
    expect(screen.y).toBeCloseTo(size.height / 2, 6);
});

test("fits within 60% of the viewport, without zooming past 100% for small nodes", () => {
    const size = { width: 1000, height: 800 };
    expect(focusViewportForNode({ position: { x: 0, y: 0 }, width: 4000, height: 4000 }, size).k).toBeCloseTo(0.12, 6);
    expect(focusViewportForNode({ position: { x: 0, y: 0 }, width: 40, height: 40 }, size).k).toBe(1);
});

test("keeps an open overlay above and below inside the viewport, with a smaller gap below the panel", () => {
    const size = { width: 900, height: 600 };
    const node = { position: { x: 0, y: 0 }, width: 340, height: 240 };
    const above = 62;
    const below = 316;
    const viewport = focusViewportForNode(node, size, { above, below });
    const top = viewport.y + node.position.y * viewport.k - above;
    const bottom = viewport.y + (node.position.y + node.height) * viewport.k + below;
    expect(top).toBeGreaterThanOrEqual(0);
    expect(bottom).toBeLessThanOrEqual(size.height);
    expect(size.height - bottom).toBeCloseTo(top / 3, 6);
});

test("shrinks the node when an open overlay would otherwise not fit", () => {
    const size = { width: 900, height: 600 };
    const node = { position: { x: 0, y: 0 }, width: 340, height: 500 };
    const withoutPanel = focusViewportForNode(node, size);
    const withPanel = focusViewportForNode(node, size, { below: 316 });
    expect(withPanel.k).toBeLessThan(withoutPanel.k);
    expect(withPanel.y + (node.position.y + node.height) * withPanel.k + 316).toBeLessThanOrEqual(size.height);
});

test("keeps the panel clear of the bottom dock, with half the usual bottom gap", () => {
    const size = { width: 900, height: 700 };
    const node = { position: { x: 0, y: 0 }, width: 340, height: 240 };
    const bottomInset = 76;
    const below = 316;
    const viewport = focusViewportForNode(node, size, { below, bottomInset });
    const top = viewport.y + node.position.y * viewport.k;
    const bottom = viewport.y + (node.position.y + node.height) * viewport.k + below;
    const usableBottom = size.height - bottomInset;
    expect(bottom).toBeLessThanOrEqual(usableBottom);
    expect(usableBottom - bottom).toBeCloseTo(top / 3, 6);
});
