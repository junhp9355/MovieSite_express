import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const port = 4000;
const pool = mysql.createPool({
  host: "localhost",
  user: "sbsst",
  password: "sbs123414",
  database: "kakaobank",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const getData = async () => {
  const data = await axios.get("http://localhost:3000/kakaobank");
};

app.get("/kakaobank/:id/:contentId", async (req, res) => {
  // params 여러개 받기
  const data = {
    kakaobank: {
      id: req.params.id,
      contentId: req.params.contentId,
    },
  };

  const {
    kakaobank: { id, contentId },
  } = data;
});

app.get("/kakaobank", async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM article ORDER BY id DESC");
  //getData()
  res.json(rows);
});

app.post("/kakaobank", async (req, res) => {
  const { title } = req.body;
  // const {
  //   body: { text },
  // } = req
  await pool.query(
    `
  INSERT INTO article
  SET reg_date = NOW(),
  body = ?;
  `,
    [title]
  );
  // const [[rows]] = await pool.query(
  //   `
  // SELECT *
  // FROM todo
  // ORDER BY id
  // DESC LIMIT 1
  // `
  // )
  ///
  const [newRows] = await pool.query(
    `
    SELECT *
    FROM article ORDER BY id DESC
    `
  );
  res.json(newRows);
  ///
});

app.get("/kakaobank/:id/", async (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;

  const [rows] = await pool.query(
    `
  SELECT *
  FROM article
  WHERE id = ?
  `,
    [id]
  );
  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  res.json(rows[0]);
});

/// 수정하기  // perform >> reg 수정함
app.patch("/kakaobank/:id", async (req, res) => {
  const { id } = req.params;
  const { reg_date, title } = req.body;

  const [rows] = await pool.query(
    `
    SELECT *
    FROM article
    WHERE id = ?
    `,
    [id]
  );

  if (rows.length === 0) {
    res.status(404).json({
      msg: "not found",
    });
  }

  // if (!perform_date) {
  //   res.status(400).json({
  //     msg: 'perform_date required',
  //   })
  //   return
  // }

  if (!title) {
    res.status(400).json({
      msg: "text required",
    });
    return;
  }

  const [rs] = await pool.query(
    `
    UPDATE article
    SET reg_date = ?,
    title = ?
    WHERE id = ?
    `,
    [reg_date, title, id]
  );

  const [newRows] = await pool.query(
    `
    SELECT *
    FROM article ORDER BY id DESC
    `
  );
  res.json(newRows);
});

/// Drag & Drop
// app.patch('/kakaobank/swap/:id', async (req, res) => {
//   const { id } = req.params;
//   const { targetId } = req.body;
//   if (!id) {
//     res.status(400).json({
//       msg: "id required"
//     });
//     return;
//   }
//   if (!targetId) {
//     res.status(400).json({
//       msg: "id targetId"
//     });
//     return;
//   }

//   await pool.query(
//     `
//     UPDATE kakaobank a INNER JOIN kakaobank b ON a.id != b.id
//     SET a.reg_date = b.reg_date,
//     a.text = b.text
//     WHERE a.id IN (? , ?) AND b.id IN (? , ?)
//     `,
//     [targetId, id, targetId, id]
//   );
//   const [newRows] = await pool.query(
//     `
//     SELECT *
//     FROM kakaobank ORDER BY id DESC
//     `
//   );
//   res.json(newRows);
// });

/// 체크하기
// app.patch('/kakaobank/abc/:id', async (req, res) => {
//   const { id } = req.params
//   const [[rows]] = await pool.query(
//     `
//     SELECT *
//   FROM kakaobank
//   WHERE id = ?
//   `,
//     [id]
//   )
//   if (!rows) {
//     res.status(404).json({
//       msg: 'not found',
//     })
//     return
//   }
//   await pool.query(
//     `
//   UPDATE kakaobank
//   SET checked = ?
//   WHERE id = ?
//   `,

//     [!rows.checked, id]
//   )

//   const [newRows] = await pool.query(
//     `
//     SELECT *
//     FROM kakaobank ORDER BY id DESC
//     `
//   )
//   res.json(newRows)
// })

/// 삭제하기
app.delete("/kakaobank/:id", async (req, res) => {
  const { id } = req.params;

  const [[kakaobankRow]] = await pool.query(
    `
    SELECT *
    FROM article
    WHERE id = ?`,
    [id]
  );

  if (kakaobankRow === undefined) {
    res.status(404).json({
      msg: "not found",
    });
    return;
  }

  await pool.query(
    `DELETE FROM article
    WHERE id = ?`,
    [id]
  );

  ///
  const [newRows] = await pool.query(
    `
    SELECT *
    FROM article ORDER BY id DESC
    `
  );
  res.json(newRows);
  ///
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
