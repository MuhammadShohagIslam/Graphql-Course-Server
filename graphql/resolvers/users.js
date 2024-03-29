const { GraphQLError } = require("graphql");
const User = require("../../models/user.model");
const shortid = require("shortid");
const { checkAuth, adminAuthCheck } = require("../../helper/checkAuth.helper");

// user create
const createNewUserHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const user = await User.findOne({ email: args.input.email });
        return user
            ? user
            : await new User({
                  ...args.input,
                  username: shortid.generate(),
              }).save();
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

// profile update
const profileUpdateHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const currentUser = await checkAuth(req);
        const updatedUser = await User.findOneAndUpdate(
            { email: currentUser.email },
            { ...args.input },
            { new: true }
        );
        return updatedUser;
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

// get all user by user role
const getAllUsersByRoleHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const currentUser = await checkAuth(req);

        // admin checking
        const adminCurrent = await adminAuthCheck(currentUser);

        let users;
        if (adminCurrent) {
            users = await User.find({ role: "user" }).exec();
        }
        return users;
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

const getAdminUserHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const currentUser = await checkAuth(req);
        // admin checking
        const adminCurrent = await adminAuthCheck(currentUser);
        const user = await User.findOne({ email: adminCurrent.email }).exec();
        return (isAdmin = user?.role === "admin");
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};
const getUserHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const currentUser = await checkAuth(req);
        const user = await User.findOne({ email: currentUser.email }).exec();
        return (isUser = user?.role === "user");
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};
const getCurrentUserHandler = async (parent, args, { req }) => {
    try {
        // auth checking
        const currentUser = await checkAuth(req);
        const user = await User.findOne({ email: currentUser.email }).exec();
        return user;
    } catch (error) {
        throw new GraphQLError(error.message || "Server Error", {
            extensions: {
                code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
            },
        });
    }
};

module.exports = {
    Query: {
        allUsersByRole: getAllUsersByRoleHandler,
        currentUser: getCurrentUserHandler,
        getAdminUser: getAdminUserHandler,
        getUser: getUserHandler,
    },
    Mutation: {
        createNewUser: createNewUserHandler,
        profileUpdate: profileUpdateHandler,
    },
};
