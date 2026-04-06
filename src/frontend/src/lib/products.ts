/**
 * products.ts
 * Clean product data layer — backend is the ONLY source of truth.
 * NO localStorage reads or writes for products.
 */

import type { backendInterface } from "@/backend";

// -----------------------------------------------------------------------
// Frontend product type
// -----------------------------------------------------------------------

export interface FEProduct {
  id: string; // bigint.toString()
  name: string;
  description: string;
  price: string;
  image: string; // base64 data URL or ""
  inStock: boolean;
  discount: number;
  createdAt: number;
}

// -----------------------------------------------------------------------
// Image compression (max 250px, 0.6 quality)
// -----------------------------------------------------------------------

async function compressImage(
  base64: string,
  maxDim = 250,
  quality = 0.6,
): Promise<string> {
  if (!base64 || !base64.startsWith("data:")) return base64;
  // Skip if already small (roughly < 50KB of base64)
  if (base64.length < 50_000) return base64;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height, 1));
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(base64);
    img.src = base64;
  });
}

// -----------------------------------------------------------------------
// Fetch (read-only — no localStorage fallback)
// -----------------------------------------------------------------------

export async function fetchProducts(
  actor: backendInterface | null,
): Promise<FEProduct[]> {
  if (!actor) return [];
  try {
    const products = await actor.getAllProducts();
    return products.map((p) => ({
      id: p.id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      image: p.image || "",
      inStock: p.inStock,
      discount: Number(p.discount),
      createdAt: Number(p.createdAt),
    }));
  } catch (e) {
    console.warn("fetchProducts error", e);
    return [];
  }
}

// -----------------------------------------------------------------------
// Write operations — throw on error (no silent fallback)
// -----------------------------------------------------------------------

export async function backendAddProduct(
  actor: backendInterface | null,
  product: Omit<FEProduct, "id" | "createdAt">,
): Promise<FEProduct> {
  if (!actor) throw new Error("Actor not available");
  const now = BigInt(Date.now());
  const compressedImage = product.image
    ? await compressImage(product.image)
    : "";
  const p = {
    id: now,
    name: product.name,
    description: product.description,
    price: product.price,
    image: compressedImage,
    inStock: product.inStock,
    discount: BigInt(Math.round(product.discount || 0)),
    createdAt: now,
  };
  await actor.addProduct(p);
  return {
    id: now.toString(),
    name: p.name,
    description: p.description,
    price: p.price,
    image: p.image,
    inStock: p.inStock,
    discount: Number(p.discount),
    createdAt: Number(p.createdAt),
  };
}

export async function backendUpdateProduct(
  actor: backendInterface | null,
  product: FEProduct,
): Promise<void> {
  if (!actor) throw new Error("Actor not available");
  const compressedImage = product.image
    ? await compressImage(product.image)
    : "";
  const id = BigInt(product.id);
  await actor.updateProduct(id, {
    id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: compressedImage,
    inStock: product.inStock,
    discount: BigInt(Math.round(product.discount || 0)),
    createdAt: BigInt(product.createdAt || Date.now()),
  });
}

export async function backendDeleteProduct(
  actor: backendInterface | null,
  id: string,
): Promise<void> {
  if (!actor) throw new Error("Actor not available");
  await actor.deleteProduct(BigInt(id));
}

// -----------------------------------------------------------------------
// One-time migration: old services → new products
// -----------------------------------------------------------------------

export async function migrateServicesToProducts(
  actor: backendInterface | null,
): Promise<void> {
  if (!actor) return;
  try {
    const [done, existingProducts] = await Promise.all([
      actor.getMigrationDone(),
      actor.getAllProducts(),
    ]);
    // If migration was marked done but products are empty, force re-run
    if (done && existingProducts.length > 0) return;

    const [services, servicesJsonRaw] = await Promise.all([
      actor.getAllServices(),
      actor.getServicesJson(),
    ]);

    let serviceImages: Record<string, string> = {};
    try {
      if (servicesJsonRaw) {
        const parsed = JSON.parse(servicesJsonRaw);
        serviceImages = parsed.serviceImages || {};
      }
    } catch {
      // ignore parse errors
    }

    if (services.length > 0) {
      const now = Date.now();
      await Promise.all(
        services.map((s, idx) => {
          const idStr = s.id.toString();
          const image = serviceImages[idStr] || "";
          return actor.addProduct({
            id: s.id,
            name: s.name,
            description: s.description,
            price: s.price,
            image,
            inStock: s.inStock,
            discount: s.discount,
            createdAt: BigInt(now + idx),
          });
        }),
      );
    }

    await actor.setMigrationDone(true);
  } catch (e) {
    console.warn("migrateServicesToProducts error", e);
  }
}
