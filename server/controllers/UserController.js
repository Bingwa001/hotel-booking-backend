export const getUserData = (req, res) => {
  try {
    // req.user is already your MongoDB doc
    const { role, recentSearchedCities } = req.user;
    res.status(200).json({ role, recentSearchedCities });
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

export const storeRecentSearchedCities = async (req, res) => {
  try {
    const { recentSearchedCity } = req.body;
    const user = req.user; // already from MongoDB

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
};
