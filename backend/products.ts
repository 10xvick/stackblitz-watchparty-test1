let data = [
  { name: "dell 101", id: 1 },
  { name: "accer 201", id: 2 },
  { name: "accer 202", id: 3 },
  { name: "lenovo 301", id: 4 },
];

export const products = {
  list: {
    method: "get",
    args: [
      "/read",
      (req, res) => {
        res.json({
          data: data.filter((e) => e),
        });
      },
    ],
  },
  create: {
    method: "post",
    args: [
      "/create",
      (req, res) => {
        const id = utility.findNextIdInArray(data);

        data[id] = { name: req.body.name, id: id + 1 };

        res.json({
          data: "successfully created " + req.body.name,
        });
      },
    ],
  },
  update: {
    method: "put",
    args: [
      "/update",
      (req, res) => {
        const { id, name } = req.body;
        const item = data.find((e) => e.id == id);
        if (item) {
          const oldname = item.name;
          item.name = name;
          res.json({
            data: "successfully modified " + oldname + " to " + name,
          });
        } else
          res.json({
            data: "item not found!",
          });
      },
    ],
  },
  delete: {
    method: "delete",
    args: [
      "/delete/:id",
      (req, res) => {
        for (let e of data) {
          if (e?.id == req.params.id) {
            delete data[e.id - 1];
            break;
          }
        }
        console.log(data);
        res.json({
          data: "successfully deleted " + req.params.id,
        });
      },
    ],
  },
};

const utility = {
  findNextIdInArray: (arr) => {
    for (let i = 0; i < arr.length; i++) if (arr[i] == undefined) return i;
    return arr.length;
  },
};
