
const create = async (Model, data) => {
  const doc = new Model(data);
  return await doc.save();
};

const insertMany = async (Model, dataArray) => {
  return await Model.insertMany(dataArray);
};

const findOne = async (Model, filter, projection = null, options = {}) => {
  return await Model.findOne(filter, projection, options).lean();
};

const findById = async (Model, id, projection = null, options = {}) => {
  return await Model.findById(id, projection, options).lean();
};

const findAll = async (Model, filter = {}, projection = null, options = {}) => {
  return await Model.find(filter, projection, options).lean();
};

const updateOne = async (Model, filter, updateData, options = {}) => {
  return await Model.updateOne(filter, { $set: updateData }, options);
};

const updateById = async (Model, id, updateData, options = {}) => {
  return await Model.findByIdAndUpdate(id, { $set: updateData }, { new: true, ...options }).lean();
};

const deleteOne = async (Model, filter) => {
  return await Model.deleteOne(filter);
};

const deleteById = async (Model, id) => {
  return await Model.findByIdAndDelete(id).lean();
};

const countDocuments = async (Model, filter = {}) => {
  return await Model.countDocuments(filter);
};

const paginate = async (Model, filter = {}, options = {}) => {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;
  const data = await Model.find(filter).sort(sort).skip(skip).limit(limit).lean();
  const total = await Model.countDocuments(filter);
  return {
    data,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
};

module.exports = {
  create,
  insertMany,
  findOne,
  findById,
  findAll,
  updateOne,
  updateById,
  deleteOne,
  deleteById,
  countDocuments,
  paginate,
};
