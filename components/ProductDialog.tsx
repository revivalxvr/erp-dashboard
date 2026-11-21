"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Upload } from "lucide-react";
import React from "react";
import { type Product } from "./ProductTable";
import { toast } from "sonner";

interface ProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    formData: FormData,
    isEdit: boolean,
    id?: string,
  ) => Promise<boolean>;
  categories: any[];
  productToEdit?: Product | null;
}

const emptyForm = {
  name: "",
  sku: "",
  category_id: "",
  category: "",
  deskripsi: "",
  price: "",
  stock: "",
  length: "",
  width: "",
  height: "",
};

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export function ProductDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
  productToEdit,
}: ProductDialogProps) {
  const [form, setForm] = React.useState(emptyForm);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | undefined>(
    undefined,
  );
  const fileRef = React.useRef<HTMLInputElement>(null);

  // di dalam komponen
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (productToEdit) {
      setForm({
        name: productToEdit.name,
        sku: productToEdit.sku,
        category_id: productToEdit.category_id
          ? productToEdit.category_id.toString()
          : "",
        category: productToEdit.category,
        deskripsi: productToEdit.deskripsi,
        price: productToEdit.price.toString(),
        stock: productToEdit.stock.toString(),
        length: productToEdit.length.toString(),
        width: productToEdit.width.toString(),
        height: productToEdit.height.toString(),
      });
      setImagePreview(productToEdit.image);
      setImageFile(null);
    } else {
      setForm(emptyForm);
      setImagePreview(undefined);
      setImageFile(null);
    }
  }, [productToEdit, isOpen]);

  React.useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const set =
    (k: keyof typeof emptyForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  // Handler saat user memilih file gambar
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert("Ukuran gambar terlalu besar! Maksimal 2MB.");
      return;
    }

    setImageFile(file);

    setImagePreview(URL.createObjectURL(file));
  };

  // Handler untuk menghapus gambar yang dipilih
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(undefined);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!imageFile && !imagePreview) {
      toast.error("Gambar produk wajib diisi!");
      return;
    }
    if (!form.category_id) {
      toast.error("Pilih kategori terlebih dahulu.");
      return;
    }

    const formDataPayload = new FormData();
    formDataPayload.append("name", form.name.trim());
    formDataPayload.append("sku", form.sku.trim().toUpperCase());
    formDataPayload.append("category_id", form.category_id); // Sesuai Postman: category_id
    formDataPayload.append("deskripsi", form.deskripsi.trim()); // Sesuai DTO: deskripsi
    formDataPayload.append("price", String(Number(form.price) || 0));
    formDataPayload.append("stock", String(Number(form.stock) || 0));
    formDataPayload.append("length", String(Number(form.length) || 0));
    formDataPayload.append("width", String(Number(form.width) || 0));
    formDataPayload.append("height", String(Number(form.height) || 0));
    formDataPayload.append("badge", "Bestseller"); // Sesuaikan jika ada state badge

    // PERHATIKAN: Key harus "product_image" sesuai dengan yang diminta backend di Postman!
    if (imageFile) {
      formDataPayload.append("product_image", imageFile);
    }

    setSubmitting(true);
    const ok = await onSubmit(
      formDataPayload,
      !!productToEdit,
      productToEdit?.id,
    );
    setSubmitting(false);
    if (ok) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {productToEdit ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
          <DialogDescription>
            {productToEdit
              ? "Ubah detail produk yang sudah ada."
              : "Isi detail produk baru."}{" "}
            Wajib menyertakan gambar produk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Bagian Upload Gambar & Thumbnail Preview */}
          <div className="grid gap-2">
            <Label>Gambar Produk</Label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative size-20 rounded-lg border overflow-hidden bg-muted flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                    title="Hapus gambar"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex size-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/40 bg-muted/50 text-muted-foreground hover:bg-muted"
                >
                  <Upload className="size-5 mb-1" />
                  <span className="text-[10px]">Upload</span>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? "Ganti gambar" : "Pilih gambar"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Format: JPG, PNG, WEBP (Maks. 2MB)
                </span>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama produk</Label>
              <Input
                id="name"
                required
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" required value={form.sku} onChange={set("sku")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>Kategori</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) => {
                  const selectedCategory = categories.find(
                    (c) => String(c.id) === value,
                  );

                  setForm((f) => ({
                    ...f,
                    category_id: value,
                    category: selectedCategory?.name ?? "",
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Harga (Rp)</Label>
              <Input
                id="price"
                type="number"
                min={0}
                required
                value={form.price}
                onChange={set("price")}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="stock">Total stok</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={set("stock")}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(
              [
                ["length", "Panjang"],
                ["width", "Lebar"],
                ["height", "Tinggi"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="grid gap-2">
                <Label htmlFor={k}>{label} (cm)</Label>
                <Input
                  id={k}
                  type="number"
                  min={0}
                  step="0.1"
                  value={form[k]}
                  onChange={set(k)}
                />
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.deskripsi}
              onChange={set("deskripsi")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
