/*
  Author : Jihoon Lee
  Date   : Jun 2012

  SceneRenderer.h
*/

#include <ros/ros.h>
#include <tf/transform_listener.h>
#include <pcl_ros/point_cloud.h>
#include <pcl_ros/transforms.h>
#include <pcl/point_cloud.h>
#include <pcl/point_types.h>
#include <pcl/filters/extract_indices.h>
#include <pcl/kdtree/kdtree_flann.h>
#include <pcl/segmentation/extract_clusters.h>
#include <pcl/octree/octree.h>
#include <pcl/octree/octree_pointcloud.h>
//#include <pcl/octree/impl/octree_iterator.hpp>
#include <visualization_msgs/MarkerArray.h>
#include <visualization_msgs/Marker.h>
#include <object_manipulation_msgs/FindClusterBoundingBox2.h>
#include <scene_renderer/Patch.h>
#include <geometry_msgs/Point.h>

#ifndef _SCENERENDERER_H_
#define _SCENERENDERER_H_

namespace scene_renderer {

  typedef pcl::PointXYZRGB Point;
  typedef pcl::PointCloud<pcl::PointXYZRGB> PointCloud;


  const std::string CLOUD_IN = "cloud_in";
  const std::string CLOUD_OUT = "cloud_out";
  const std::string MARKER_OUT = "patch_marker";

  const std::string processing_frame ="/world";

  const std::string find_bounding_box_name = "/find_cluster_bounding_box2";

  class SceneRenderer
  {
    private:
      ros::NodeHandle nh;
      ros::Publisher cloud_publisher;
      ros::Publisher marker_publisher;
  //  ros::Publisher object_publisher;
      ros::Subscriber cloud_sub;
      ros::ServiceClient find_bounding_box_srv;

      tf::TransformListener tflistener;
    
      float patch_size;
      std::vector<scene_renderer::Patch> patches;

      int min_cluster_size;
      int max_cluster_size;
      float cluster_distance;

      int patch_width;
      int patch_height;

    public:
      SceneRenderer(int argc,char** argv);
      ~SceneRenderer();

      // This function receives point cloud2, converts to pcl::pointcloud, and transform to world frame
		  void updateWorld(PointCloud::Ptr cloud);
      void spin();

      void processCloud(const sensor_msgs::PointCloud2::ConstPtr& msg);
        void convertToWorldFrame(const sensor_msgs::PointCloud2::ConstPtr& msg,PointCloud::Ptr cloud);
  };
}
#endif
