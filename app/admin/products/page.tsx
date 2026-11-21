"use client";

import * as React from "react";
import { toast } from "sonner";
import { ProductTable, type Product } from "@/components/ProductTable"; 
import { ProductDialog } from "@/components/ProductDialog";
import { DeleteProductDialog } from "@/components/DeleteProductDialog";
import { productApi } from "@/lib/product";
import { useEffect } from "react";
import { useHeader } from "@/components/header-context";

export default function ProductsPage() {
  const { setTitle } = useHeader();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null,
  );
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(
    null,
  );

  const fetchProducts = async () => {
    try {
      const res = await productApi.get("/products?page=1&search=");
      setProducts(res.data.data);
    } catch (error) {
      console.error("Gagal memuat produk:", error);
      toast.error("Gagal memuat daftar produk.");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await productApi.get("/categories?page=1&search=");
      setCategories(res.data.data);
    } catch (error) {
      console.error("Gagal memuat kategori:", error);
    }
  };

  useEffect(() => {
    setTitle("Products");
    fetchProducts();
    fetchCategories();
  }, []);

  const handleFormSubmit = async (
    formData: FormData,
    isEdit: boolean,
    id?: string,
  ): Promise<boolean> => {
    try {
      if (isEdit && id) {
        await productApi.put(`/products/${id}`, formData);
        toast.success("Produk berhasil diperbarui!");
      } else {
        await productApi.post("/products", formData);
        toast.success("Produk baru berhasil ditambahkan!");
      }
      fetchProducts();
      return true;
    } catch (error: any) {
      console.error("Gagal menyimpan produk:", error);
      toast.error(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan produk.",
      );
      return false;
    }
  };
  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    try {
      await productApi.delete(`/products/${productToDelete.id}`);
      setIsDeleteOpen(false);
      setProductToDelete(null);
      toast.success("Produk berhasil dihapus!");
      fetchProducts();
    } catch (error: any) {
      console.error("Gagal menghapus produk:", error);
      toast.error("Gagal menghapus produk dari database.");
    }
  };
  const handleAdd = React.useCallback(() => {
    setEditingProduct(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = React.useCallback((p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  }, []);

  const handleDeleteClick = React.useCallback((p: Product) => {
    setProductToDelete(p);
    setIsDeleteOpen(true);
  }, []);
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <ProductDialog
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        categories={categories}
        productToEdit={editingProduct}
      />
      <DeleteProductDialog
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name}
      />
      <ProductTable
        data={products}
        categories={categories}
        onAddClick={handleAdd}
        onEditClick={handleEdit}
        onDeleteClick={handleDeleteClick}
      />
    </div>
  );
}
