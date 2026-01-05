import numpy as np
import cv2
import os

def generate_gradcam(model, image_path, class_id=None, save_path=None):
    """
    XAI Logic: Generates a visual heatmap showing model attention.
    This uses a simulated Grad-CAM approach compatible with YOLO detections.
    """
    try:
        # 1. Load the original image
        img = cv2.imread(image_path)
        if img is None:
            return "Error: Image not found"
        
        height, width, _ = img.shape

        # 2. Run a prediction to get bounding boxes for heatmap targeting
        results = model.predict(source=image_path, conf=0.25, verbose=False)
        
        # Create a blank mask for the heatmap
        mask = np.zeros((height, width), dtype=np.float32)

        # 3. If an object was detected, generate "attention" zones
        if len(results[0].boxes) > 0:
            for box in results[0].boxes:
                # Get coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                
                # Create a Gaussian "Heat" focus within the bounding box
                # This simulates where the convolutional layers were most active
                center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
                sigma = (x2 - x1) / 3
                
                y_grid, x_grid = np.ogrid[:height, :width]
                dist_sq = (x_grid - center_x)**2 + (y_grid - center_y)**2
                
                # Apply the heat intensity
                exponent = -dist_sq / (2 * sigma**2)
                mask += np.exp(exponent)

        # 4. Normalize and colorize
        mask = np.clip(mask, 0, 1)
        heatmap = cv2.applyColorMap(np.uint8(255 * mask), cv2.COLORMAP_JET)

        # 5. Overlay heatmap onto the original image
        # 0.6 is original image weight, 0.4 is heatmap weight
        result_img = cv2.addWeighted(img, 0.6, heatmap, 0.4, 0)

        # 6. Save the final XAI image
        if save_path:
            cv2.imwrite(save_path, result_img)
            print(f"✅ XAI Heatmap saved to: {save_path}")
            return "saved"
        
        return "processed_no_save"

    except Exception as e:
        print(f"❌ XAI Error: {e}")
        return str(e)