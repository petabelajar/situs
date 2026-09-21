/* Peta Belajar — seluruh logika situs.
   Untuk menambah atau mengaktifkan produk, ubah blok PRODUK di bawah,
   lalu unggah ulang file ini. Tidak ada file lain yang perlu disentuh. */
(function () {
  "use strict";

  /* ════════════════════════════════════════════════════════════
     DAFTAR PRODUK — bagian ini saja yang perlu diubah nanti.
     Kunci di kiri = nama subdomain.
     "mtk-smp"  ->  mtk-smp.petabelajar.my.id
     Untuk menambah produk baru:
       1. deploy Apps Script-nya, salin URL /exec
       2. tambahkan satu baris di bawah, status "aktif"
       3. di Cloudflare, tambahkan subdomainnya
     ════════════════════════════════════════════════════════════ */
  var PRODUK = {
    "mtk-smp": {
      nama: "TKA Matematika SMP",
      ringkas: "20 soal diagnostik, 4 elemen, untuk kelas 9.",
      status: "aktif",
      exec: "https://script.google.com/macros/s/AKfycbyk_Q2BKE3NmRIq6xufUvzi-NONpGebMuZJRWJkvxyaJPd3A64cTfx_1Q2mKiJ0a7am/exec"
    },
    "mtk-sd": {
      nama: "Matematika SD",
      ringkas: "Sedang disiapkan.",
      status: "segera",
      exec: ""
    },
    "bindo-smp": {
      nama: "Bahasa Indonesia SMP",
      ringkas: "Sedang disiapkan.",
      status: "segera",
      exec: ""
    },
    "bindo-sd": {
      nama: "Bahasa Indonesia SD",
      ringkas: "Sedang disiapkan.",
      status: "segera",
      exec: ""
    }
  };

  /* Alamat tiap tes: petabelajar.my.id/mtk-smp
     Kalau suatu saat pindah ke subdomain, ubah MODE jadi "subdomain". */
  var MODE = "path";
  var DOMAIN = "petabelajar.my.id";

  // ─── tentukan tes mana yang dibuka ───
  var kunci = "";

  // 1. dari variabel yang dipasang folder produk (cara utama)
  if (typeof window.TES === "string" && window.TES) kunci = window.TES;

  // 2. dari nama folder di alamat, mis. /mtk-smp/
  if (!kunci) {
    var ruas = location.pathname.split("/").filter(function (x) { return x; });
    if (ruas.length && PRODUK[ruas[ruas.length - 1]]) kunci = ruas[ruas.length - 1];
  }

  // 3. dari subdomain, kalau nanti dipakai
  if (!kunci) {
    var bagian = location.hostname.toLowerCase().split(".");
    if (bagian.length > 2 && bagian[0] !== "www" && PRODUK[bagian[0]]) kunci = bagian[0];
  }

  // 4. untuk dicoba di komputer sendiri: index.html?p=mtk-smp
  var paksa = new URLSearchParams(location.search).get("p");
  if (paksa) kunci = paksa;

  var p = PRODUK[kunci];

  if (p && p.status === "aktif" && p.exec) {
    tampilkanProduk(p);
  } else if (p) {
    tampilkanBeranda("Tes " + p.nama + " belum dibuka. Silakan pilih tes lain di bawah.");
  } else {
    tampilkanBeranda("");
  }

  // ─── mode produk: bingkai penuh layar ───
  function tampilkanProduk(prod) {
    document.title = prod.nama + " — Peta Belajar";
    var wadah = document.getElementById("bingkaiProduk");
    var memuat = document.getElementById("memuat");
    memuat.hidden = false;
    document.getElementById("memuatTeks").textContent = "Memuat " + prod.nama + "…";
    wadah.style.display = "block";

    var bg = document.createElement("iframe");
    // teruskan ?voucher=… (dari WhatsApp), ?akses=… (link hasil) dan ?contoh=… ke aplikasi tes
    var q = new URLSearchParams(location.search), terus = [];
    ["voucher", "contoh", "akses"].forEach(function (k) {
      var v = q.get(k);
      if (v && /^[A-Za-z0-9-]{1,20}$/.test(v)) terus.push(k + "=" + encodeURIComponent(v));
    });
    bg.src = prod.exec + (terus.length ? "?" + terus.join("&") : "");
    bg.title = prod.nama;
    bg.setAttribute("allow", "clipboard-write");
    bg.onload = function () { memuat.classList.add("pergi"); };
    wadah.appendChild(bg);

    // kalau 12 detik belum termuat, tawarkan jalan langsung
    setTimeout(function () {
      if (memuat.classList.contains("pergi")) return;
      var d = document.getElementById("darurat");
      d.hidden = false;
      d.innerHTML = 'Lebih lama dari biasanya. <a href="' + prod.exec + '">Buka langsung</a>';
    }, 12000);
  }

  // ─── mode beranda ───
  function tampilkanBeranda(pesan) {
    var daftar = document.getElementById("daftarProduk");

    /* Halaman produk hanya berisi cangkang kosong. Kalau tesnya belum dibuka,
       antar pengunjung ke halaman depan yang sebenarnya. */
    if (!daftar) { location.replace(akarSitus()); return; }

    document.getElementById("beranda").style.display = "block";
    var ld = document.querySelector(".hero .lead");
    if (pesan && ld) ld.textContent = pesan + " " + ld.textContent;
    Object.keys(PRODUK).forEach(function (k) {
      var d = PRODUK[k];
      var aktif = d.status === "aktif" && d.exec;
      var el = document.createElement(aktif ? "a" : "div");
      el.className = "produk" + (aktif ? "" : " mati");
      if (aktif) {
        el.href = MODE === "subdomain"
          ? location.protocol + "//" + k + "." + DOMAIN
          : akarSitus() + k + "/";
      }
      el.innerHTML =
        '<span class="tanda ' + (aktif ? "tanda-aktif" : "tanda-segera") + '">' +
        (aktif ? "Tersedia" : "Segera") + "</span>" +
        "<h3>" + d.nama + "</h3><p>" + d.ringkas + "</p>" +
        (aktif ? '<span class="tuju">Mulai tes &rarr;</span>' : "");
      daftar.appendChild(el);
    });

    gambarKontur();
  }

  /* Akar situs, supaya tautan tetap benar baik saat dibuka dari
     petabelajar.my.id maupun saat diuji dari folder di komputer. */
  function akarSitus() {
    var ruas = location.pathname.split("/").filter(function (x) { return x; });
    if (ruas.length && PRODUK[ruas[ruas.length - 1]]) ruas.pop();
    var akhir = ruas[ruas.length - 1] || "";
    if (akhir.indexOf(".html") !== -1) ruas.pop();
    return "/" + (ruas.length ? ruas.join("/") + "/" : "");
  }

  // ─── ilustrasi peta kontur ───
  function gambarKontur() {
    var svg = document.getElementById("kontur");
    if (!svg) return;
    var ns = "http://www.w3.org/2000/svg";
    var pusat = [
      { x: 132, y: 140, r: 62 }, { x: 336, y: 104, r: 72 },
      { x: 540, y: 156, r: 68 }, { x: 730, y: 110, r: 58 }
    ];
    var frag = document.createDocumentFragment();
    function lingkar(cx, cy, rad, benih) {
      var d = "", n = 44;
      for (var i = 0; i <= n; i++) {
        var a = (i / n) * Math.PI * 2;
        var r = rad * (1 + 0.085 * Math.sin(a * 3 + benih) + 0.05 * Math.sin(a * 5 - benih * 1.7));
        d += (i === 0 ? "M" : "L") + (cx + Math.cos(a) * r).toFixed(1) + " " + (cy + Math.sin(a) * r * 0.74).toFixed(1);
      }
      return d + "Z";
    }
    pusat.forEach(function (q, idx) {
      for (var k = 5; k >= 1; k--) {
        var path = document.createElementNS(ns, "path");
        path.setAttribute("d", lingkar(q.x, q.y, q.r * (k / 5), idx * 1.4 + k * 0.45));
        path.setAttribute("fill", k === 1 ? "#DCE8FC" : "none");
        path.setAttribute("stroke", "#BDD3F6");
        path.setAttribute("stroke-width", k === 5 ? "1.5" : "1");
        path.setAttribute("opacity", (0.35 + k * 0.1).toFixed(2));
        frag.appendChild(path);
      }
      var titik = document.createElementNS(ns, "circle");
      titik.setAttribute("cx", q.x); titik.setAttribute("cy", q.y); titik.setAttribute("r", "6.5");
      titik.setAttribute("fill", idx === 1 ? "#E3A21A" : "#1E4FA8");
      frag.appendChild(titik);
      var cincin = document.createElementNS(ns, "circle");
      cincin.setAttribute("cx", q.x); cincin.setAttribute("cy", q.y); cincin.setAttribute("r", "11");
      cincin.setAttribute("fill", "none");
      cincin.setAttribute("stroke", idx === 1 ? "#E3A21A" : "#1E4FA8");
      cincin.setAttribute("stroke-width", "1.4"); cincin.setAttribute("opacity", ".45");
      frag.appendChild(cincin);
    });
    var jalur = document.createElementNS(ns, "path");
    var d = "M" + pusat[0].x + " " + pusat[0].y;
    for (var i = 1; i < pusat.length; i++) {
      var a = pusat[i - 1], b = pusat[i];
      d += "C" + (a.x + 68) + " " + (a.y - 28) + "," + (b.x - 68) + " " + (b.y + 28) + "," + b.x + " " + b.y;
    }
    jalur.setAttribute("d", d); jalur.setAttribute("fill", "none");
    jalur.setAttribute("stroke", "#1E4FA8"); jalur.setAttribute("stroke-width", "1.6");
    jalur.setAttribute("stroke-dasharray", "5 6"); jalur.setAttribute("opacity", ".4");
    frag.appendChild(jalur);
    svg.appendChild(frag);
  }
})();
