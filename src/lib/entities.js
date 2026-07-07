import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
} from "firebase/firestore";

function createEntityModule(collectionName) {
  const colRef = collection(db, collectionName);

  return {
    async create(data) {
      const docRef = await addDoc(colRef, {
        ...data,
        created_date: serverTimestamp(),
        updated_date: serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    },

    async get(id) {
      const snap = await getDoc(doc(db, collectionName, id));
      if (!snap.exists()) return null;
      return { id: snap.id, ...snap.data() };
    },

    async list(sortBy = "-created_date", max = 100) {
      let field = sortBy;
      let direction = "asc";
      if (sortBy.startsWith("-")) {
        field = sortBy.slice(1);
        direction = "desc";
      }
      const q = query(colRef, orderBy(field, direction), fbLimit(max));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          created_date: data.created_date?.toDate ? data.created_date.toDate().toISOString() : data.created_date,
        };
      });
    },

    async filter(filters = {}, sortBy = "-created_date", max = 100) {
      let field = sortBy;
      let direction = "asc";
      if (sortBy.startsWith("-")) {
        field = sortBy.slice(1);
        direction = "desc";
      }
      const conditions = Object.entries(filters).map(([key, value]) =>
        where(key, "==", value)
      );
      const q = query(colRef, ...conditions, orderBy(field, direction), fbLimit(max));
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          created_date: data.created_date?.toDate ? data.created_date.toDate().toISOString() : data.created_date,
        };
      });
    },

    async update(id, data) {
      await updateDoc(doc(db, collectionName, id), {
        ...data,
        updated_date: serverTimestamp(),
      });
      return { id, ...data };
    },

    async delete(id) {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    },
  };
}

export const DiseaseInfo = createEntityModule("disease_info");
export const PlantScan = createEntityModule("plant_scans");
export const User = createEntityModule("users");
