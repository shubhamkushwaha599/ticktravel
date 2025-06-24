const create = async (Model, data) => {
  try {
    const doc = new Model(data);
    return await doc.save();
  } catch (err) {
    console.error("DB Create Error:", err.message);
    throw err;
  }
};

const insertMany = async (Model, dataArray) => {
  try {
    return await Model.insertMany(dataArray);
  } catch (err) {
    console.error("DB InsertMany Error:", err.message);
    throw err;
  }
};

const findOne = async (Model, filter, projection = null, options = {}) => {
  try {
    return await Model.findOne(filter, projection, options).lean();
  } catch (err) {
    console.error("DB FindOne Error:", err.message);
    throw err;
  }
};

const findById = async (Model, id, projection = null, options = {}) => {
  try {
    return await Model.findById(id, projection, options).lean();
  } catch (err) {
    console.error("DB FindById Error:", err.message);
    throw err;
  }
};

const findAll = async (Model, filter = {}, projection = null, options = {}) => {
  try {
    return await Model.find(filter, projection, options).lean();
  } catch (err) {
    console.error("DB FindAll Error:", err.message);
    throw err;
  }
};

const updateOne = async (Model, filter, updateData, options = {}) => {
  try {
    return await Model.updateOne(filter, { $set: updateData }, options);
  } catch (err) {
    console.error("DB UpdateOne Error:", err.message);
    throw err;
  }
};

const updateById = async (Model, id, updateData, options = {}) => {
  try {
    return await Model.findByIdAndUpdate(id, { $set: updateData }, { new: true, ...options }).lean();
  } catch (err) {
    console.error("DB UpdateById Error:", err.message);
    throw err;
  }
};

const deleteOne = async (Model, filter) => {
  try {
    return await Model.deleteOne(filter);
  } catch (err) {
    console.error("DB DeleteOne Error:", err.message);
    throw err;
  }
};

const deleteById = async (Model, id) => {
  try {
    return await Model.findByIdAndDelete(id).lean();
  } catch (err) {
    console.error("DB DeleteById Error:", err.message);
    throw err;
  }
};

const countDocuments = async (Model, filter = {}) => {
  try {
    return await Model.countDocuments(filter);
  } catch (err) {
    console.error("DB CountDocuments Error:", err.message);
    throw err;
  }
};

const paginate = async (Model, filter = {}, options = {}) => {
  try {
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
  } catch (err) {
    console.error("DB Paginate Error:", err.message);
    throw err;
  }
};

// ✅ Optional Add-ons

const findOrCreate = async (Model, filter, defaults = {}) => {
  try {
    let doc = await Model.findOne(filter).lean();
    if (!doc) {
      doc = await new Model({ ...filter, ...defaults }).save();
    }
    return doc;
  } catch (err) {
    console.error("DB FindOrCreate Error:", err.message);
    throw err;
  }
};

const softDeleteById = async (Model, id, deletedField = "isDeleted") => {
  try {
    return await Model.findByIdAndUpdate(id, { $set: { [deletedField]: true } }, { new: true }).lean();
  } catch (err) {
    console.error("DB SoftDeleteById Error:", err.message);
    throw err;
  }
};

const aggregate = async (Model, pipeline = []) => {
  try {
    return await Model.aggregate(pipeline);
  } catch (err) {
    console.error("DB Aggregate Error:", err.message);
    throw err;
  }
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

  // Optional exports
  findOrCreate,
  softDeleteById,
  aggregate
};
