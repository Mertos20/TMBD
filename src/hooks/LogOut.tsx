import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // localStorage'daki tüm kullanıcı verilerini temizle
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    // opsiyonel: tüm localStorage'ı temizlemek için:
    // localStorage.clear();

    // Giriş sayfasına yönlendir
    navigate("/login");
  };

  return logout;
};

export default useLogout;
