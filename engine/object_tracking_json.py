# USAGE
# python opencv_object_tracking.py
# python opencv_object_tracking.py --video dashcam_boston.mp4 --tracker csrt
# Press `s` key to begin tracking
# CREDITS: https://www.pyimagesearch.com/2018/07/30/opencv-object-tracking/

# import the necessary packages
import json

from imutils.video import VideoStream
from imutils.video import FPS
import argparse
import imutils
import time
import cv2
import base64
import threading

totalResult = []


def scaleRect(rect, scale):
    return (int(rect[0] * scale), int(rect[1] * scale), int(rect[2] * scale), int(rect[3] * scale))


def trackObject(object, args):
    result = {}

    # extract the OpenCV version info
    (major, minor) = cv2.__version__.split(".")[:2]

    # if we are using OpenCV 3.2 OR BEFORE, we can use a special factory
    # function to create our object tracker
    if int(major) == 3 and int(minor) < 3:
        tracker = cv2.Tracker_create(args["tracker"].upper())

    # otherwise, for OpenCV 3.3 OR NEWER, we need to explicity call the
    # approrpiate object tracker constructor:
    else:
        # initialize a dictionary that maps strings to their corresponding
        # OpenCV object tracker implementations
        OPENCV_OBJECT_TRACKERS = {
            "csrt": cv2.TrackerCSRT_create,
            "kcf": cv2.TrackerKCF_create,
            "boosting": cv2.TrackerBoosting_create,
            "mil": cv2.TrackerMIL_create,
            "tld": cv2.TrackerTLD_create,
            "medianflow": cv2.TrackerMedianFlow_create,
            "mosse": cv2.TrackerMOSSE_create
        }

        # grab the appropriate object tracker using our dictionary of
        # OpenCV object tracker objects
        tracker = OPENCV_OBJECT_TRACKERS[args["tracker"]]()
    # tracker = cv2.Tracker_create(args["tracker"].upper())
    # initialize the bounding box coordinates of the object we are going
    # to track

    initBB = None

    # if a video path was not supplied, grab the reference to the web cam
    if not args.get("video", False):
        print("[INFO] starting video stream...")
        vs = VideoStream(src=0).start()
        time.sleep(1.0)

    # otherwise, grab a reference to the video file
    else:
        vs = cv2.VideoCapture(args["video"])

    fps = vs.get(cv2.CAP_PROP_FPS)
    # print("FPS: " + str(fps))

    vs.set(cv2.CAP_PROP_POS_FRAMES, object['time'] * fps)
    # print("Pos: ", object['time'] * fps)

    result['id'] = object['id']
    result['fps'] = fps
    result['start'] = int(object['time'] * fps)
    result['track'] = []
    # exit(0)

    # width of processing video
    pWidth = 200

    # initialize the FPS throughput estimator
    # fps = None

    # loop over frames from the video stream

    initBB = (
        object['location']['left'], object['location']['top'], object['location']['width'],
        object['location']['height'])

    width = vs.get(cv2.CAP_PROP_FRAME_WIDTH)
    height = vs.get(cv2.CAP_PROP_FRAME_HEIGHT)

    initBB = scaleRect(initBB, pWidth / width)

    frame = vs.read()
    oFrame = frame[1] if args.get("video", False) else frame
    frame = imutils.resize(oFrame, width=pWidth)
    tracker.init(frame, initBB)
    count = int(fps)
    # fps = FPS().start()
    while True:
        count = count + 1
        # grab the current frame, then handle if we are using a
        # VideoStream or VideoCapture object
        frame = vs.read()

        oFrame = frame[1] if args.get("video", False) else frame
        # resize the frame (so we can process it faster) and grab the
        # frame dimensions
        # check to see if we have reached the end of the stream
        if oFrame is None:
            break
        frame = imutils.resize(oFrame, width=pWidth)
        (H, W) = frame.shape[:2]

        # check to see if we are currently tracking an object

        if initBB is not None:  # grab the new bounding box coordinates of the object
            (success, box) = tracker.update(frame)

            # check to see if the tracking was a success
            if success:
                (x, y, w, h) = [int(v) for v in box]
                # print(str(count) + ": [" + str(x) + ", " + str(y) + ", " + str(w) + ", " + str(h) + "]")
                rect = scaleRect((x, y, w, h), width / pWidth)
                # print(str(count) + ": [" + str(rect[0]) + ", " + str(rect[1]) + ", " + str(rect[2]) + ", " + str(rect[3]) + "]")
                # cv2.rectangle(oFrame, (rect[0], rect[1]), (rect[0]+ rect[2], rect[1] + rect[3]), (0, 255, 0), 2)
                cv2.rectangle(oFrame, (int(rect[0]), int(rect[1])),
                              (int(rect[0]) + int(rect[2]), int(rect[1]) + int(rect[3])), (0, 255, 0), 2)
                result['track'].append([rect[1], rect[0], rect[2], rect[3]])
            else:
                break
            # update the FPS counters
            # fps.update()
            # fps.stop()

            # initialize the set of information we'll be displaying on
            # the frame
            info = [
                ("Tracker", args["tracker"]),
                ("Success", "Yes" if success else "No"),
                # ("FPS", "{:.2f}".format(fps.fps())),
            ]

            # loop over the info tuples and draw them on our frame
            for (i, (k, v)) in enumerate(info):
                text = "{}: {}".format(k, v)
                cv2.putText(oFrame, text, (10, H - ((i * 20) + 20)),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        #
        # show the output frame
        cv2.imshow("Frame", oFrame)
        key = cv2.waitKey(1) & 0xFF  # do not remove this line

        # if the 's' key is selected, we are going to "select" a bounding
        # box to track
        # if key == ord("s"):
        # select the bounding box of the object we want to track (make
        # sure you press ENTER or SPACE after selecting the ROI)
        # initBB = cv2.selectROI("Frame", frame, fromCenter=False,
        #                        showCrosshair=True)

        # start OpenCV object tracker using the supplied bounding box
        # coordinates, then start the FPS throughput estimator as well
        # tracker.init(frame, initBB)
        # fps = FPS().start()

        # if the `q` key was pressed, break from the loop
        # elif key == ord("q"):
        #     break
    # print(count)
    # if we are using a webcam, release the pointer
    if not args.get("video", False):
        vs.stop()

    # otherwise, release the file pointer
    else:
        vs.release()

    # close all windows

    # print(result)
    totalResult.append(result)


def main():
    # construct the argument parser and parse the arguments
    ap = argparse.ArgumentParser()
    ap.add_argument("-v", "--video", type=str,
                    help="path to input video file")
    ap.add_argument("-o", "--objects", type=str,
                    help="OpenCV objects info")
    ap.add_argument("-t", "--tracker", type=str, default="kcf",
                    help="OpenCV object tracker type")
    args = vars(ap.parse_args())

    # read object info from argument
    objects = json.loads(base64.standard_b64decode(args['objects']))
    objects = json.loads(objects['objects'])
    # object = objects[0]

    threads = []
    for object in objects:
        # trackObject(object, args)
        thread = threading.Thread(target=trackObject, args=(object, args))
        thread.start()
        threads.append(thread)

    for thread in threads:
        thread.join()

    print(json.dumps(totalResult))
    # cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
