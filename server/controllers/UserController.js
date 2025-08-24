//GET /api/user/
export const getUserData = async (req, res) => {
    try {
        const role = req.user.role;
        const recentSearchedCities = req.user.recentSearchedCities;
        return res.status(200).json({ role, recentSearchedCities });
    } catch (error) {
        return res.status(500).json({ message: 'Server Error: ' + error.message });
    }
}

//Store User Recent Searched Cities
export const storeRecentSearchedCities = async (req, res) => {
    try {
        const { recentSearchedCity } = req.body;
        const user = req.user;

        if (user.recentSearchedCities.length < 3) {
            user.recentSearchedCities.push(recentSearchedCity);
        } else {
            user.recentSearchedCities.shift();
            user.recentSearchedCities.push(recentSearchedCity);
        }
        
        await user.save();
        res.json({ success: true, message: "City added successfully" });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
}