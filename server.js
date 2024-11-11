// Import the FFmpeg.wasm library for video processing
const { createFFmpeg, fetchFile } = FFmpeg;
const ffmpeg = createFFmpeg({ log: true }); // Initialize FFmpeg with logging enabled

// Get references to the HTML elements
const phraseInput = document.getElementById("phrase-input"); // Input field for user phrase
const searchButton = document.getElementById("search-button"); // Search button
const videoElement = document.getElementById("sign-video"); // Video element for demonstration
const videoSource = document.getElementById("video-source"); // Source element of the video
const gifElement = document.getElementById("sign-gif"); // GIF element for demonstration

// Function to fetch video and convert it to GIF
async function fetchAndConvertVideoToGIF(phrase) {
    try {
        // Construct the API URL with the user's input phrase
        const apiUrl = `https://example.com/api/signlanguage?phrase=${encodeURIComponent(phrase)}`;
        
        // Fetch data from the API
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Failed to fetch video"); // Handle errors

        // Parse the JSON response to get the video URL
        const data = await response.json();
        const videoUrl = data.videoUrl; // Extract the video URL from the response

        // Load FFmpeg.wasm if it's not already loaded
        if (!ffmpeg.isLoaded()) await ffmpeg.load();

        // Fetch the video file as a Blob
        const videoResponse = await fetch(videoUrl);
        const videoBlob = await videoResponse.blob();

        // Write the video file to FFmpeg's filesystem
        await ffmpeg.FS("writeFile", "input.mp4", await fetchFile(videoBlob));

        // Run FFmpeg command to convert video to GIF
        await ffmpeg.run(
            "-i", "input.mp4", // Input file
            "-vf", "fps=10,scale=320:-1:flags=lanczos", // Video filter for frame rate and scaling
            "-loop", "0", // Loop the GIF indefinitely
            "output.gif" // Output file name
        );

        // Read the generated GIF from FFmpeg's filesystem
        const gifData = ffmpeg.FS("readFile", "output.gif");
        const gifBlob = new Blob([gifData.buffer], { type: "image/gif" }); // Create a Blob from the GIF data
        const gifUrl = URL.createObjectURL(gifBlob); // Create a URL for the GIF

        // Set the GIF source and display it
        gifElement.src = gifUrl; // Set the source of the GIF element
        gifElement.style.display = "block"; // Make the GIF visible
        videoElement.style.display = "none"; // Hide the video element
    } catch (error) {
        console.error("Error:", error); // Log errors to the console
        alert("Could not fetch or convert video. Please try again."); // Alert user of failure
    }
}

// Event listener for the search button
searchButton.addEventListener("click", () => {
    const phrase = phraseInput.value.trim(); // Get the trimmed input value
    if (phrase) {
        fetchAndConvertVideoToGIF(phrase); // Call function with the user's input
    } else {
        alert("Please enter a phrase."); // Alert if input is empty
    }
});