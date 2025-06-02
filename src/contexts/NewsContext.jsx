import { createContext, useContext, useEffect, useState } from "react";
import { getPosts } from "../services/api";

const NewContext = createContext();

export const useNews = () => useContext(NewContext);

export const NewProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getPosts();
        // Lọc bài viết không bị xóa
        const filteredNews = data.filter((post) => post.isDelete !== true);
        setNews(filteredNews);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bài viết:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <NewContext.Provider value={{ news, loading }}>
      {children}
    </NewContext.Provider>
  );
};
